import fs from "fs";
import path from "path";
import { JackCompilerError } from "../src/error";
import { CustomErrorListener } from "../src/listener/error.listener";
import {
  CharStreams,
  CommonTokenStream,
  ParseTreeListener,
  ParseTreeWalker,
} from "antlr4";
import JackLexer from "../src/generated/JackLexer";
import JackParser, { ProgramContext } from "../src/generated/JackParser";
import { GenericSymbol, SubroutineInfo, SubroutineType } from "../src/symbol";
export function createSubroutineSymbol(
  type: SubroutineType,
  params: string[],
  localVarsCount?: number
): GenericSymbol {
  const s = { paramNames: params, type } as SubroutineInfo;
  if (localVarsCount != undefined) {
    s.localVarsCount = localVarsCount;
  }
  return { subroutineInfo: s } as GenericSymbol;
}

export function parseJackFile(filePath: string, trace = false) {
  const errorListener: CustomErrorListener = new CustomErrorListener();
  const f = fs.readFileSync(filePath, "utf8");
  return parseJackText(f, errorListener, trace);
}

export function parseJackText(
  src: string,
  errorListener?: CustomErrorListener,
  trace = false,
  throwOnErrors = true
): ProgramContext {
  if (errorListener === undefined) {
    errorListener = new CustomErrorListener();
  }
  const inputStream = CharStreams.fromString(src);
  const lexer = new JackLexer(inputStream);
  if (errorListener) {
    lexer.removeErrorListeners();
    lexer.addErrorListener(errorListener);
  }

  const tokenStream = new CommonTokenStream(lexer);
  const parser = new JackParser(tokenStream);
  if (errorListener != undefined) {
    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);
  }
  const tree = parser.program();

  expect(tokenStream.tokens.length).toBeGreaterThan(0);
  if (errorListener.errors.length > 0) {
    console.error("Parser or lexer errors found");
    handleErrors(src, errorListener.errors);
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
