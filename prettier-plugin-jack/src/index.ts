import type { Parser, Plugin, Printer, SupportLanguage } from 'prettier';
import { print } from './printer';
import { parse } from './parser';

// https://prettier.io/docs/en/plugins.html#languages
const languages: Partial<SupportLanguage>[] = [
	{
		name: 'jack',
		parsers: ['jack'],
		extensions: ['.jack'],
		vscodeLanguageIds: ['jack'],
	},
];

// https://prettier.io/docs/en/plugins.html#parsers
const parsers: Record<string, Parser> = {
	jack: {
		parse,
		astFormat: 'jack',
		locStart: (node) => node.position.start.offset,
		locEnd: (node) => node.position.end.offset,
	},
};

// https://prettier.io/docs/en/plugins.html#printers
const printers: Record<string, Printer> = {
	jack: {
		print,
	},
};
export default { languages, parsers, printers } as Plugin;