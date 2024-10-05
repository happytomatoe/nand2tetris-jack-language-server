import { BinderListener } from "./listener/binder.listener.js";
import { CustomErrorListener } from "./listener/error.listener.js";
import { ValidatorListener } from "./listener/validator.listener.js";
import { JackCompilerError, LexerOrParserError } from "./error.js";
import { VMWriter } from "./listener/vm.writer.listener.js";
import JackParser, { ProgramContext } from "./generated/JackParser.js";
import { CharStreams, CommonTokenStream, ParseTreeWalker } from "antlr4";
import JackLexer from "./generated/JackLexer.js";

export class Compiler {
  private binder = new BinderListener();
  private errorListener = new CustomErrorListener();
  validate(
    tree: ProgramContext,
    filename?: string,
  ): ProgramContext | JackCompilerError[] {
    if (Object.keys(this.binder.globalSymbolTable).length == 0) {
      throw new Error(
        "Please populate global symbol table using parserAndBind method",
      );
    }
    const validator = new ValidatorListener(
      this.binder.globalSymbolTable,
      filename,
    );
    ParseTreeWalker.DEFAULT.walk(validator, tree);

    return validator.errors.length > 0 ? validator.errors : tree;
  }
  compile(
    tree: ProgramContext,
    filename?: string,
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

  parserAndBind(src: string): ProgramContext | JackCompilerError[] {
    const lexer = new JackLexer(CharStreams.fromString(src));
    lexer.removeErrorListeners();
    lexer.addErrorListener(this.errorListener);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new JackParser(tokenStream);
    parser.removeErrorListeners();
    parser.addErrorListener(this.errorListener);
    const tree = parser.program();
    if (this.errorListener.errors.length > 0) {
      console.log("Errors when parsing or lexing");
      return this.errorListener.errors;
    }
    ParseTreeWalker.DEFAULT.walk(this.binder, tree);
    if (this.binder.errors.length > 0) {
      console.log("Errors in binder");
      return this.binder.errors;
    }
    return tree;
  }
}
