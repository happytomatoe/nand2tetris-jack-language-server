import { ProgramContext } from "jack-compiler";
import { AstPath, Doc, doc, ParserOptions } from "prettier";
import { JackVisitor } from "./formatter.visitor";

// const { join, line, ifBreak, group } = doc.builders;
export function print<T>(
	path: AstPath<T>,
	options: ParserOptions<T>,
	print: (path: AstPath<T>) => Doc,
	args?: unknown,
): Doc {

	// console.log("Inside printer");
	const tree = path.node as ProgramContext;
	const val = tree.accept(new JackVisitor());
	// console.log("Doc",JSON.stringify(val, null, 2));
	return val;
}
