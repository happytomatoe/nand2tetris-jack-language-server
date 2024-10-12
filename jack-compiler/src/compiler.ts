import { BinderListener } from "./listener/binder.listener";
import { CustomErrorListener } from "./listener/error.listener";
import { ValidatorListener } from "./listener/validator.listener";
import { JackCompilerError } from "./error";
import { VMWriter } from "./listener/vm.writer.listener";
import JackParser, { ProgramContext } from "./generated/JackParser";
import { CharStreams, CommonTokenStream, ParseTreeWalker } from "antlr4";
import JackLexer from "./generated/JackLexer";
import { GlobalSymbolTable } from "./symbol";

export class Compiler {
  private binder = new BinderListener();
  parse(src: string): ProgramContext | JackCompilerError[] {
    const errorListener = new CustomErrorListener();
    const lexer = new JackLexer(CharStreams.fromString(src));
    lexer.removeErrorListeners();
    lexer.addErrorListener(errorListener);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new JackParser(tokenStream);
    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);
    const tree = parser.program();
    if (errorListener.errors.length > 0) {
      console.log("Errors when parsing or lexing");
      return errorListener.errors;
    }
    return tree;
  }

  bind(tree: ProgramContext): ProgramContext | JackCompilerError[] {
    ParseTreeWalker.DEFAULT.walk(this.binder, tree);
    if (this.binder.errors.length > 0) {
      console.log("Errors in binder");
      return this.binder.errors;
    }
    return tree;
  }
  validate(
    tree: ProgramContext,
    filename?: string
  ): ProgramContext | JackCompilerError[] {
    if (Object.keys(this.binder.globalSymbolTable).length == 0) {
      throw new Error(
        "Please populate global symbol table using parserAndBind method"
      );
    }
    const validator = new ValidatorListener(
      this.binder.globalSymbolTable,
      filename
    );
    ParseTreeWalker.DEFAULT.walk(validator, tree);

    return validator.errors.length > 0 ? validator.errors : tree;
  }
  compile(
    tree: ProgramContext,
    filename?: string
  ): string | JackCompilerError[] {
    const treeOrErrors = this.validate(tree, filename);
    if (Array.isArray(treeOrErrors)) {
      const errors = treeOrErrors as JackCompilerError[];
      console.log("Errors in validator " + JSON.stringify(errors));
      return errors;
    }
    const validateTree = treeOrErrors as ProgramContext;
    const vmWriter = new VMWriter(this.binder.globalSymbolTable);
    ParseTreeWalker.DEFAULT.walk(vmWriter, validateTree);
    return vmWriter.result;
  }
  get globalSymbolTable(): GlobalSymbolTable {
    return this.binder.globalSymbolTable;
  }
}
