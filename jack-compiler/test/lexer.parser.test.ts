import * as fs from "fs";
import path from "path";
import { Compiler } from "../src/compiler";
import { JackCompilerError } from "../src/error";
describe("Lexer and parser", () => {
  test("valid code", () => {
    const text = fs.readFileSync(
      path.join(__dirname, "resources", "bugs", "PrintAllSymbols.jack"),
      "utf-8"
    );
    console.log(text);
    const t = new Compiler().parse(text);
    if (Array.isArray(t)) {
      throw new Error("Expected no errors, got: " + t.join("\n"));
    }
  });
  test("Lexer error", () => {
    const t = new Compiler().parse(`class A{%}`);
    expect(Array.isArray(t)).toBeTruthy();
    if (Array.isArray(t)) {
      expect(t[0].type).toEqual("LexerOrParserError");
      expect(t[0].span).toEqual({
        line: 1,
        start: 8,
        end: 9,
      });
    }
  });
  test("Parser error", () => {
    const t = new Compiler().parse(`class A{let}`);
    expect(Array.isArray(t)).toBeTruthy();
    if (Array.isArray(t)) {
      expect(t[0].type).toEqual("LexerOrParserError");
      expect(t[0].span).toEqual({
        line: 1,
        start: 8,
        end: 11,
      });
    }
  });
});
