import type { Parser, Printer, SupportLanguage } from 'prettier';
import { print } from './printer';
import { parse } from './parser';

// https://prettier.io/docs/en/plugins.html#languages
export const languages: Partial<SupportLanguage>[] = [
	{
		name: 'jack',
		parsers: ['jack'],
		extensions: ['.jack'],
		vscodeLanguageIds: ['jack'],
	},
];

// https://prettier.io/docs/en/plugins.html#parsers
export const parsers: Record<string, Parser> = {
	jack: {
		parse,
		astFormat: 'jack',
		locStart: (node) => node.position.start.offset,
		locEnd: (node) => node.position.end.offset,
	},
};

// https://prettier.io/docs/en/plugins.html#printers
export const printers: Record<string, Printer> = {
	jack: {
		print,
	},
};