import { BinaryOperatorContext, ClassDeclarationContext, ProgramContext } from 'jack-compiler/out/generated/JackParser';
import JackParserVisitor from 'jack-compiler/out/generated/JackParserVisitor';
import { Doc } from 'prettier';
import { builders } from 'prettier/doc';

export class JackVisitor extends JackParserVisitor<Doc[]> {
	visitClassDeclaration = (ctx: ClassDeclarationContext): builders.Doc[] => {
		return ["a"];
	};
}