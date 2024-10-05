import { AstPath, Doc, doc } from "prettier";

const { join, line, ifBreak, group } = doc.builders;
export function print(
	// Path to the AST node to print
	path: AstPath,
	options: object,
	// Recursively print a child node
	print: (selector?: string | number | Array<string | number> | AstPath) => Doc,
  ): Doc{
	return "";
  }