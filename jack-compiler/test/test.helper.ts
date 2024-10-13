import fs from "fs";
import path from "path";
import { JackCompilerError } from "../src/error";
import {
  CharStreams,
  CommonTokenStream,
  ParseTreeListener,
  ParseTreeWalker,
} from "antlr4";
import JackLexer from "../src/generated/JackLexer";
import JackParser, { ProgramContext } from "../src/generated/JackParser";
import {
  GenericSymbol,
  Position,
  SubroutineInfo,
  SubroutineType,
} from "../src/symbol";
import {
  LexerErrorListener,
  ParserErrorListener,
} from "../src/listener/error.listener";
export function createSubroutineSymbol(
  type: SubroutineType,
  params: string[],
  localVarsCount?: number,
  filename: string = "",
  start?: Position,
  end?: Position
): GenericSymbol {
  const s = { paramNames: params, type } as SubroutineInfo;
  if (localVarsCount != undefined) {
    s.localVarsCount = localVarsCount;
  }
  return { subroutineInfo: s, filename, start, end } as GenericSymbol;
}

export function parseJackFile(filePath: string, trace = false) {
  const lexerErrorListener = new LexerErrorListener();
  const parserErrorListener = new ParserErrorListener();
  const f = fs.readFileSync(filePath, "utf8");
  return parseJackText(f, lexerErrorListener, parserErrorListener, trace);
}

export function parseJackText(
  src: string,
  lexerErrorListener?: LexerErrorListener,
  parserErrorListener?: ParserErrorListener,
  trace = false,
  throwOnErrors = true
): ProgramContext {
  if (lexerErrorListener === undefined) {
    lexerErrorListener = new LexerErrorListener();
  }
  if (parserErrorListener === undefined) {
    parserErrorListener = new ParserErrorListener();
  }
  const inputStream = CharStreams.fromString(src);
  const lexer = new JackLexer(inputStream);
  if (lexerErrorListener) {
    lexer.removeErrorListeners();
    lexer.addErrorListener(lexerErrorListener);
  }

  const tokenStream = new CommonTokenStream(lexer);
  const parser = new JackParser(tokenStream);
  if (parserErrorListener != undefined) {
    parser.removeErrorListeners();
    parser.addErrorListener(parserErrorListener);
  }
  const tree = parser.program();

  expect(tokenStream.tokens.length).toBeGreaterThan(0);
  if (lexerErrorListener.errors.length > 0) {
    console.error("Lexer errors found");
    handleErrors(src, lexerErrorListener.errors);
  }
  if (parserErrorListener.errors.length > 0) {
    console.error("Lexer errors found");
    handleErrors(src, parserErrorListener.errors);
  }
  return tree;
}

export function getTestResourcePath(relativePath: string) {
  return path.join(__dirname, "resources", "test", relativePath);
}

export function listenToTheTree<T extends ParseTreeListener>(
  tree: ProgramContext,
  listener: T
) {
  ParseTreeWalker.DEFAULT.walk(listener, tree);
  return listener;
}

export function handleErrors(src: string, errors: JackCompilerError[]) {
  const msg = errors
    .map((e) => {
      return `${e.span.line}:${e.span.start} ${e.msg}\n${src.split("\n")[e.span.line]}`;
    })
    .join("\n");
  console.error(msg);
  throw new Error(msg);
}
export const testResourceDirs: string[] = [
  "Average",
  "ConvertToBin",
  "Fraction",
  "HelloWorld",
  "List",
  "Pong",
  "Square",
  "ComplexArrays",
];
