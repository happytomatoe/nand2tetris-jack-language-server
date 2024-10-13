import { Compiler } from "../src/compiler";
import { LexerOrParserError, Span } from "../src/error";

describe("Lexer and parser", () => {
  test("Lexer error", () => {
    const t = new Compiler().parse(`class A{%}`);
    expect(Array.isArray(t)).toBeTruthy();
    expect(t[0]).toBeInstanceOf(LexerOrParserError);
    expect((t[0] as LexerOrParserError).span).toEqual({
      line: 1,
      start: 8,
      end: 9,
    } as Span);
  });
  test("Parser error", () => {
    const t = new Compiler().parse(`class A{let}`);
    expect(Array.isArray(t)).toBeTruthy();
    expect(t[0]).toBeInstanceOf(LexerOrParserError);
    expect((t[0] as LexerOrParserError).span).toEqual({
      line: 1,
      start: 8,
      end: 11,
    } as Span);
  });
});
