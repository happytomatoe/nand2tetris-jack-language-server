import fs from "fs";
import path from "path";
import { builtInSymbols } from "../src/builtins";
import { JackCompilerErrorType } from "../src/error";
import { GlobalSymbolTableListener } from "../src/listener/global.symbol.listener";
import {
  GenericSymbol,
  GlobalSymbolTable,
  SubroutineType,
} from "../src/symbol";
import {
  createSubroutineSymbol,
  getTestResourcePath,
  listenToTheTree,
  parseJackFile,
  parseJackText,
} from "./test.helper";

describe("Jack binder", () => {
  const jestConsole = console;

  beforeEach(() => {
    global.console = require("console");
  });

  afterEach(() => {
    global.console = jestConsole;
  });

  test("should fail on duplicated subroutine", () => {
    const input = `
      class Main {
          function void f(){
              return;
          }
          function int f(){
              return 1;
          }
      }`;
    testBinder(input, "DuplicatedSubroutineError");
  });

  test("duplicated class", () => {
    const input = `
      class Main {
      }`;
    const globalSymbolTableListener = new GlobalSymbolTableListener();
    testBinder(input, undefined, globalSymbolTableListener);
    testBinder(input, "DuplicatedClassError", globalSymbolTableListener);
  });
  test("duplicated built in class", () => {
    const input = `
      class Math {
      }`;
    testBinder(input, "DuplicatedClassError");
  });
  test("basic", () => {
    const expected: GlobalSymbolTable = {
      ...builtInSymbols,
      Fraction: {
        filename: "",
        start: { line: 7, character: 6 },
        end: { line: 7, character: 14 },
      },
      "Fraction.new": createSubroutineSymbol(
        SubroutineType.Constructor,
        ["x", "y"],
        0,
        undefined,
        { line: 11, character: 24 },
        { line: 11, character: 27 }
      ),
      "Fraction.reduce": createSubroutineSymbol(
        SubroutineType.Method,
        [],
        1,
        undefined,
        { line: 19, character: 15 },
        { line: 19, character: 21 }
      ),
      "Fraction.getNumerator": createSubroutineSymbol(
        SubroutineType.Method,
        [],
        0,

        undefined,
        { line: 30, character: 14 },
        { line: 30, character: 26 }
      ),
      "Fraction.getDenominator": createSubroutineSymbol(
        SubroutineType.Method,
        [],
        0,
        undefined,
        { line: 31, character: 14 },
        { line: 31, character: 28 }
      ),
      "Fraction.plus": createSubroutineSymbol(
        SubroutineType.Method,
        ["other"],
        1,
        undefined,
        { line: 34, character: 19 },
        { line: 34, character: 23 }
      ),
      "Fraction.dispose": createSubroutineSymbol(
        SubroutineType.Method,
        [],
        0,
        undefined,
        { line: 43, character: 15 },
        { line: 43, character: 22 }
      ),
      "Fraction.print": createSubroutineSymbol(
        SubroutineType.Method,
        [],
        0,
        undefined,
        { line: 49, character: 15 },
        { line: 49, character: 20 }
      ),
      "Fraction.gcd": createSubroutineSymbol(
        SubroutineType.Function,
        ["a", "b"],
        1,

        undefined,
        { line: 57, character: 16 },
        { line: 57, character: 19 }
      ),
      Main: {
        filename: "",
        start: { line: 7, character: 6 },
        end: { line: 7, character: 10 },
      } as GenericSymbol,
      "Main.main": createSubroutineSymbol(
        SubroutineType.Function,
        [],
        3,
        "",
        { line: 8, character: 17 },
        { line: 8, character: 21 }
      ),
    };
    let globalSymbolsListener = new GlobalSymbolTableListener();

    const testFolder = getTestResourcePath("Fraction");
    const files = fs
      .readdirSync(testFolder)
      .filter((file) => file.endsWith(".jack"))
      .map((file) => path.join(testFolder, file));
    for (const filePath of files) {
      const tree = parseJackFile(filePath);
      globalSymbolsListener = listenToTheTree(tree, globalSymbolsListener);
    }
    expect(globalSymbolsListener.globalSymbolTable).toEqual(expected);
  });
});
function testBinder<T extends JackCompilerErrorType>(
  input: string,
  expectedError?: T,
  globalSymbolTableListener = new GlobalSymbolTableListener()
) {
  const tree = parseJackText(input);
  listenToTheTree(tree, globalSymbolTableListener);
  const errors = globalSymbolTableListener.errors;
  if (expectedError) {
    if (errors.length > 1) {
      console.error("Errors", errors);
    }
    try {
      expect(errors.length).toBe(1);
      expect(errors[0].type).toEqual(expectedError);
    } catch (_error) {
      throw new Error(
        `Expected error ${expectedError} but got '` +
          JSON.stringify(errors) +
          "'"
      );
    }
  } else {
    if (errors.length != 0)
      throw new Error("Didn't expect any errors but got " + errors.join("\n"));
  }
}
