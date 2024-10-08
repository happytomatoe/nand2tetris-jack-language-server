import { ProgramContext } from "jack-compiler";
import { AstPath, Doc, ParserOptions } from "prettier";
import { JackVisitor } from "./formatter.visitor";
import { CommonTokenStream } from "antlr4";

export function print<T>(
	path: AstPath<T>,
	options: ParserOptions<T>,
	print: (path: AstPath<T>) => Doc,
	args?: unknown,
): Doc {

	// console.log("Inside printer");
	const [tree, tokenStream] = path.node as [ProgramContext, CommonTokenStream];
	const val = tree.accept(new JackVisitor(tokenStream));
	// console.log("Doc",JSON.stringify(val, null, 2));
	return val;
}
