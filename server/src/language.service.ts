import { assert } from "console";
import * as fs from "fs";
import { Compiler, JackCompilerError } from "jack-compiler";
import { GlobalSymbolTable, SubroutineScope } from "jack-compiler/out/symbol";
import * as path from "path";
import * as prettier from "prettier";
import { JackPlugin } from "prettier-plugin-jack";
import {
  CompletionItem,
  CompletionItemKind,
  CompletionList,
  DefinitionParams,
  Diagnostic,
  DiagnosticSeverity,
  DocumentFormattingParams,
  InsertTextFormat,
  Location,
  Position,
  Range,
  TextDocumentPositionParams,
  TextDocuments,
  TextEdit,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";

export class LanguageService {
  constructor(private documents: TextDocuments<TextDocument>) {}
  async validateTextDocument(
    textDocument: TextDocument | undefined
  ): Promise<Diagnostic[]> {
    if (textDocument == null) return [];
    const text = textDocument.getText();
    const compiler = new Compiler();
    const selectedFilePath = URI.parse(textDocument.uri).fsPath;
    const dir = path.dirname(selectedFilePath);

    const parsedOrErrors = compiler.parse(text);
    if (Array.isArray(parsedOrErrors)) {
      return parsedOrErrors.map((m) => toDiagnostics(textDocument, m));
    }

    const files = fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".jack"))
      .map((file) => path.join(dir, file));
    for (const filePath of files) {
      if (filePath == selectedFilePath) continue;
      const content = fs.readFileSync(filePath, {
        encoding: "utf8",
        flag: "r",
      });
      const treeOrErrors = compiler.parse(content);
      if (!Array.isArray(treeOrErrors)) {
        compiler.bind(treeOrErrors);
      }
    }

    const bindedOrErrors = compiler.bind(parsedOrErrors);
    if (Array.isArray(bindedOrErrors)) {
      return bindedOrErrors.map((m) => toDiagnostics(textDocument, m));
    }
    const classNameFromFilename = selectedFilePath.substring(
      selectedFilePath.lastIndexOf(path.sep) + 1,
      selectedFilePath.indexOf(".jack")
    );
    const validatedOrErrors = compiler.validate(
      bindedOrErrors,
      classNameFromFilename
    );
    if (Array.isArray(validatedOrErrors)) {
      console.log("Errors: " + validatedOrErrors);
      return validatedOrErrors.map((m) => toDiagnostics(textDocument, m));
    }
    return [];
  }
  async formatDocument(
    formatParams: DocumentFormattingParams
  ): Promise<TextEdit[]> {
    const document = this.documents.get(formatParams.textDocument.uri);

    if (!document || (await this.validateTextDocument(document)).length > 0) {
      console.log("Cannot format invalid document: ");
      return [];
    }

    try {
      const text = document.getText();
      const formatted = await prettier.format(text, {
        parser: "jack",
        plugins: [JackPlugin],
        tabWidth: formatParams.options.tabSize,
        singleQuote: false,
        useTabs: !formatParams.options.insertSpaces,
      });
      return [
        TextEdit.replace(
          Range.create(Position.create(0, 0), document.positionAt(text.length)),
          formatted
        ),
      ];
    } catch (error) {
      if (typeof error == "string")
        console.error("Error formatting document:" + error);
      if (error instanceof Error) {
        console.error("Error formatting document:" + error.message);
      }
      return [];
    }
  }

  provideCodeCompletions(
    _textDocumentPosition: TextDocumentPositionParams
  ): CompletionList {
    const textDocument = this.documents.get(
      _textDocumentPosition.textDocument.uri
    );
    if (textDocument == null) {
      return { items: [], isIncomplete: true };
    }
    const pos = _textDocumentPosition.position;
    const line = textDocument
      .getText()
      .substring(
        textDocument.offsetAt({ line: pos.line, character: 0 }),
        textDocument.offsetAt(pos)
      );
    const identifierRegex = /([A-Za-z_][A-Za-z0-9_]*\.)$/g;
    const matches = line.match(identifierRegex);
    if (matches == null || matches.length == 0) {
      return { items: [], isIncomplete: true };
    }
    const subroutineId = matches[0];

    const matchedSubroutines = this.findSymbol({
      position: _textDocumentPosition.position,
      subroutineId: subroutineId,
      textDocument: textDocument,
      matchMode: "startsWith",
    });
    if (matchedSubroutines == null) {
      return { items: [], isIncomplete: true };
    }
    const items = matchedSubroutines.map(([k, v]) => {
      const label = k.substring(k.indexOf(".") + 1);
      const params = v.subroutineInfo?.paramNames
        .map((v, i) => {
          return "${" + (i + 1) + ":" + v + "}";
        })
        .join(",");
      return {
        label: label,
        kind: CompletionItemKind.Function,
        data: k,
        insertText: label + "(" + params + ")",
        insertTextFormat: InsertTextFormat.Snippet,
      } as CompletionItem;
    });
    return { isIncomplete: false, items };
  }

  findDefinition(params: DefinitionParams): Location[] | undefined {
    const textDocument = this.documents.get(params.textDocument.uri);
    if (textDocument == null) {
      return undefined;
    }
    const pos = params.position;
    const lineBefore = textDocument
      .getText()
      .substring(
        textDocument.offsetAt({ line: pos.line, character: 0 }),
        textDocument.offsetAt({ line: pos.line, character: pos.character })
      );
    const lineAfter = textDocument
      .getText()
      .substring(
        textDocument.offsetAt({ line: pos.line, character: pos.character }),
        textDocument.offsetAt({ line: pos.line + 1, character: 0 })
      );
    const beforeMatches =
      lineBefore.match(/([A-Za-z_][A-Za-z0-9_\\.]+)$/g) ?? [];
    const afterMatches = lineAfter.match(/^[\w]+/g) ?? [];
    if (
      beforeMatches.length == 0 ||
      afterMatches.length == 0 ||
      beforeMatches[0] == null ||
      afterMatches[0] == null
    ) {
      return undefined;
    }
    let subroutineId = beforeMatches[0] + afterMatches[0];
    if(!subroutineId.includes(".")){
      //local method
      const className = textDocument.uri.match(/([A-Z][A-Za-z0-9_]*)\.jack$/)?.[1];
      if(className == null){
        return undefined;
      }
      subroutineId = className + "." + subroutineId;
    }

    const matchedSubroutines = this.findSymbol({
      position: params.position,
      subroutineId: subroutineId,
      textDocument: textDocument,
      matchMode: "equals",
    });
    const symbol = matchedSubroutines?.[0][1] ?? undefined;
    if (
      symbol == null ||
      symbol.filename == null ||
      symbol.start == null ||
      symbol.end == null
    ) {
      return undefined;
    }
    const start = symbol.start;
    const end = symbol.end;
    const res = Location.create(symbol.filename, {
      start: { line: start.line - 1, character: start.character },
      end: { line: end.line - 1, character: end.character },
    });
    return [res];
  }

  private findSymbol(t: {
    textDocument: TextDocument;
    position: Position;
    subroutineId: string;
    matchMode: SubroutineMatchMode;
  }) {
    const { textDocument, position } = t;
    let subroutineId = t.subroutineId;
    const documentBeforeCurrentCharacter = textDocument.getText({
      start: { line: 0, character: 0 },
      end: position,
    });
    const localSubroutines = documentBeforeCurrentCharacter.match(
      /(?:function|method|constructor)\s[A-za-z_0-9]+\s([A-za-z_0-9]+)/g
    );
    if (localSubroutines == null) {
      return undefined;
    }

    const globalSymbols = createGlobalSymbolTable(textDocument.uri);

    //find local symbol type and set it to subroutineId
    if (localSubroutines.length > 0) {
      const subroutineName = localSubroutines.pop()?.split(" ").pop();
      if (subroutineName != null) {
        const t = getLocalSymbols(textDocument, globalSymbols, subroutineName);
        if (t != null) {
          const identifier = subroutineId.substring(
            0,
            subroutineId.indexOf(".")
          );
          const symbol =
            t.locals.find((a) => a.name == identifier) ??
            t.arguments.find((a) => a.name === identifier) ??
            t.fields.find((a) => a.name === identifier) ??
            t.staticFields.find((a) => a.name === identifier);
          if (symbol) {
            subroutineId =
              symbol.type + subroutineId.substring(subroutineId.indexOf("."));
          }
        }
      }
    }
    return Object.entries(globalSymbols).filter(([globalSymbol, _]) => {
      switch (t.matchMode) {
        case "startsWith":
          return globalSymbol.startsWith(subroutineId);
        case "equals":
          return globalSymbol === subroutineId;
        default: {
          const exhaustiveCheck: never = t.matchMode;
          throw new Error(`Unhandled mode case: ${exhaustiveCheck}`);
        }
      }
    });
  }
}

function getLocalSymbols(
  textDocument: TextDocument,
  globalSymbolTable: GlobalSymbolTable,
  subroutineName: string
): SubroutineScope | undefined {
  const compiler = new Compiler();
  compiler.globalSymbolTable = globalSymbolTable;
  const parsedTree = compiler.parse(textDocument.getText(), true);
  if (Array.isArray(parsedTree)) {
    console.error("Something went wrong ");
    return undefined;
  }
  const tree = compiler.validate(parsedTree, undefined, true);
  if (Array.isArray(tree)) {
    console.error("Something went wrong. Expected tree ");
    return undefined;
  }
  const s = tree
    .classDeclaration()
    ?.subroutineDeclaration()
    ?.find(
      (v) =>
        v.subroutineDecWithoutType()?.subroutineName().getText() ==
        subroutineName
    );
  return s?.symbols;
}

type SubroutineMatchMode = "startsWith" | "equals";

function createGlobalSymbolTable(textDocumentUri: string): GlobalSymbolTable {
  const compiler = new Compiler();
  const selectedFilePath = URI.parse(textDocumentUri).fsPath;
  const dir = path.dirname(selectedFilePath);
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".jack"))
    .map((file) => path.join(dir, file));
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, {
      encoding: "utf8",
      flag: "r",
    });
    const treeOrErrors = compiler.parse(content, true);
    if (!Array.isArray(treeOrErrors)) {
      compiler.bind(treeOrErrors, filePath);
    }
  }
  assert(
    Object.keys(compiler.globalSymbolTable).length,
    "Global symbol table shouldn't be empty"
  );
  return compiler.globalSymbolTable;
}

function toDiagnostics(textDocument: TextDocument, e: JackCompilerError) {
  return {
    severity: DiagnosticSeverity.Error,
    range: {
      start: textDocument.positionAt(e.span.start),
      end: textDocument.positionAt(e.span.end),
    },
    message: e.msg,
  };
}
