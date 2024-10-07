function split(str: string, delimeter: string): string[] {
	return str.split(delimeter);
}
declare global {
	interface String {
		stripMargin(): string;
	}
}
String.prototype.stripMargin = function (): string {
	return split(this, '\n').map(line => line.substring(line.indexOf('|') + 1)).join('\n');
}

export { }