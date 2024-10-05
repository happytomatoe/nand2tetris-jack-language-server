import { AstPath, Doc, doc, ParserOptions } from "prettier";

const { join, line, ifBreak, group } = doc.builders;
export function print<T>(
	path: AstPath<T>,
	options: ParserOptions<T>,
	print: (path: AstPath<T>) => Doc,
	args?: unknown,
): Doc {
	return "";
}
