import { CharStream, CommonTokenStream } from 'antlr4ng';
import { JackParser } from 'jack-compiler/out/generated/JackParser';
import { JackLexer } from 'jack-compiler/out/generated/JackLexer';
import { AST } from "prettier";
export function parse(text: string, _options: object): Promise<AST> | AST {
  const lexer = new JackLexer(CharStream.fromString(text));
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new JackParser(tokenStream);
  const tree = parser.program();
  return [tree, tokenStream];
}
