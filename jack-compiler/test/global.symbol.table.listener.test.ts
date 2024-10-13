import fs from "fs";
import path from "path";
import { DuplicatedClassError, DuplicatedSubroutineError } from "../src/error";
import { BinderListener } from "../src/listener/global.symbol.listener";
import {
  GenericSymbol,
  GlobalSymbolTable,
  SubroutineType,
} from "../src/symbol";
import { builtInSymbols } from "../src/builtins";
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
      class A {
          function void f(){
              return;
          }
          function int f(){
              return 1;
          }
      }`;
    testBinder(input, DuplicatedSubroutineError);
  });

  test("duplicated class", () => {
    const input = `
      class A {
      }`;
    const binder = new BinderListener();
    testBinder(input, undefined, binder);
    testBinder(input, DuplicatedClassError, binder);
  });
  test("duplicated built in class", () => {
    const input = `
      class Math {
      }`;
    testBinder(input, DuplicatedClassError);
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
    let globalSymbolsListener = new BinderListener();

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
function testBinder<T extends { name: string }>(
  input: string,
  expectedError?: T,
  binder = new BinderListener()
) {
  const tree = parseJackText(input);
  listenToTheTree(tree, binder);
  const errors = binder.errors;
  if (expectedError) {
    if (errors.length > 1) {
      console.error("Errors", errors);
    }
    try {
      expect(errors.length).toBe(1);
      expect(errors[0]).toBeInstanceOf(expectedError);
    } catch (e) {
      throw new Error(
        `Expected error ${expectedError.name} but got '` +
          errors.join(",") +
          "'"
      );
    }
  } else {
    if (errors.length != 0)
      throw new Error("Didn't expect any errors but got " + errors.join("\n"));
  }
}