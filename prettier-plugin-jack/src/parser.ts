import { CharStreams, CommonTokenStream } from 'antlr4';
import JackLexer from 'jack-compiler/out/generated/JackLexer';
import JackParser from 'jack-compiler/out/generated/JackParser';
import { AST } from 'prettier';
export function parse(text: string, options: object): Promise<AST> | AST {
	const lexer = new JackLexer(CharStreams.fromString(text));
	// tokenSource = new CollectorTokenSource(lexer)
	const tokenStream = new CommonTokenStream(lexer);
	tokenStream.getHiddenTokensToLeft
	const parser = new JackParser(tokenStream);
	const tree = parser.program();
	return [tree, tokenStream];
}