import { Compiler } from 'jack-compiler/dist';
import { AST } from 'prettier';
export function parse(text: string, options: object): Promise<AST> | AST {
	return new Compiler().parse(text);
}