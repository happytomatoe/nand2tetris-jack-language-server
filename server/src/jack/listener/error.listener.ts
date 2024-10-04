import {
  ErrorListener,
  NoViableAltException,
  RecognitionException,
  Recognizer,
  Token,
} from "antlr4";
import { JackCompilerError, LexerOrParserError } from "../error.js";
interface LexerNoViableAltException {
  startIndex: number;
}
export class CustomErrorListener extends ErrorListener<any> {
  public errors: JackCompilerError[] = [];

  override syntaxError = (
    recognizer: Recognizer<any>,
    offendingSymbol: any,
    line: number,
    column: number,
    msg: string,
    e: RecognitionException | undefined,
  ) => {
    this.errors.push(
      new LexerOrParserError(
        line,
        column,
        column + 1,
        msg,
      ),
    );
  };
}
