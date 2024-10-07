import type { Parser, Plugin, Printer, SupportLanguage } from 'prettier';
import { print } from './printer';
import { parse } from './parser';

// https://prettier.io/docs/en/plugins.html#languages
const languages: SupportLanguage[] = [
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
		locStart: () => -1,
		locEnd: () => -1,
	},
}

// https://prettier.io/docs/en/plugins.html#printers
const printers: Record<string, Printer> = {
	jack: {
		print,
	},
}
export const JackPlugin: Plugin<string> = { languages, parsers, printers }