import { Compiler } from 'jack-compiler';
import { AST } from 'prettier';
export function parse(text: string, options: object): Promise<AST> | AST {
	console.log("Parsing in formatter");
	return new Compiler().parse(text);
}