import { GlobalSymbolTableListener as GlobalSymbolTableListener } from "./listener/global.symbol.listener";
import { CustomErrorListener } from "./listener/error.listener";
import { ValidatorListener } from "./listener/validator.listener";
import { JackCompilerError } from "./error";
import { VMWriter } from "./listener/vm.writer.listener";
import { GlobalSymbolTable } from "./symbol";
import { JackParser, ProgramContext } from "./generated/JackParser";
import { JackLexer } from "./generated/JackLexer";
import { CharStream, CommonTokenStream, ParseTreeWalker } from "antlr4ng";

export class Compiler {
  private globalSymbolTableListener = new GlobalSymbolTableListener();
  /**
   * Parses the given source code string into an Abstract Syntax Tree (AST) using the JackLexer and JackParser.
   *
   * @param src - The source code string to be parsed.
   * @returns - A ProgramContext object representing the parsed AST if no errors occurred.
   *            An array of JackCompilerError objects if errors were encountered during parsing or lexing.
   */
  parse(src: string): ProgramContext | JackCompilerError[] {
    const errorListener = new CustomErrorListener();
    const lexer = new JackLexer(CharStream.fromString(src));
    lexer.removeErrorListeners();
    lexer.addErrorListener(errorListener);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new JackParser(tokenStream);
    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);
    const tree = parser.program();
    if (errorListener.errors.length > 0) {
      console.log("Errors when parsing or lexing");
      return errorListener.errors;
    }
    return tree;
  }

  bind(
    tree: ProgramContext,
    fileName?: string
  ): ProgramContext | JackCompilerError[] {
    this.globalSymbolTableListener.errors = [];
    this.globalSymbolTableListener.filename = fileName ?? "";
    ParseTreeWalker.DEFAULT.walk(this.globalSymbolTableListener, tree);
    if (this.globalSymbolTableListener.errors.length > 0) {
      console.log("Errors in binder");
      return this.globalSymbolTableListener.errors;
    }
    return tree;
  }
  validate(
    tree: ProgramContext,
    filename?: string
  ): ProgramContext | JackCompilerError[] {
    if (
      Object.keys(this.globalSymbolTableListener.globalSymbolTable).length == 0
    ) {
      throw new Error(
        "Please populate global symbol table using parserAndBind method"
      );
    }
    const validator = new ValidatorListener(
      this.globalSymbolTableListener.globalSymbolTable,
      filename
    );
    ParseTreeWalker.DEFAULT.walk(validator, tree);

    return validator.errors.length > 0 ? validator.errors : tree;
  }
  compile(
    tree: ProgramContext,
    filename?: string
  ): string | JackCompilerError[] {
    const treeOrErrors = this.validate(tree, filename);
    if (Array.isArray(treeOrErrors)) {
      const errors = treeOrErrors as JackCompilerError[];
      console.log("Errors in validator " + JSON.stringify(errors));
      return errors;
    }
    const validateTree = treeOrErrors as ProgramContext;
    const vmWriter = new VMWriter(
      this.globalSymbolTableListener.globalSymbolTable
    );
    ParseTreeWalker.DEFAULT.walk(vmWriter, validateTree);
    return vmWriter.result;
  }
  get globalSymbolTable(): GlobalSymbolTable {
    return this.globalSymbolTableListener.globalSymbolTable;
  }
}
