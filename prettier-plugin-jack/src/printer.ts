import { ProgramContext } from "jack-compiler";
import { AstPath, Doc, doc, ParserOptions } from "prettier";
// import { JackVisitor } from "./jack.visitor";

// const { join, line, ifBreak, group } = doc.builders;
export function print<T>(
	path: AstPath<T>,
	options: ParserOptions<T>,
	print: (path: AstPath<T>) => Doc,
	args?: unknown,
): Doc {
	console.log("Inside printer");
	// const tree = path.node as ProgramContext;
	// return tree.accept(new JackVisitor());
	return "a";
}
