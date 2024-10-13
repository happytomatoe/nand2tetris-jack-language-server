import {
  ErrorListener,
  NoViableAltException,
  RecognitionException,
  Recognizer,
  Token,
} from "antlr4";
import { JackCompilerError, LexerOrParserError } from "../error";
interface LexerNoViableAltException {
  startIndex: number;
}
export class CustomLexerErrorListener extends ErrorListener<number> {
  public errors: JackCompilerError[] = [];
  syntaxError(
    _recognizer: Recognizer<number>,
    _offendingSymbol: number,
    line: number,
    _column: number,
    msg: string,
    e: RecognitionException | undefined
  ): void {
    //antlr doesn't provide a class for LexerNoViableAltException atm. Once https://github.com/antlr/antlr4/pull/4711 is release we can change it
    if (e != null && "startIndex" in e) {
      const err = e as LexerNoViableAltException;
      this.errors.push(
        new LexerOrParserError(line, err.startIndex, err.startIndex + 1, msg)
      );
    } else {
      console.error("Don't know how to handle this error");
      throw new Error("Don't know how to handle this error");
    }
  }
}

export class CustomParserErrorListener extends ErrorListener<Token> {
  public errors: JackCompilerError[] = [];

  override syntaxError = (
    _recognizer: Recognizer<Token>,
    offendingSymbol: Token,
    line: number,
    _column: number,
    msg: string,
    e: RecognitionException | undefined
  ) => {
    if (offendingSymbol != null || (e != null && e.offendingToken != null)) {
      const t = offendingSymbol ?? (e?.offendingToken as Token);
      this.errors.push(new LexerOrParserError(line, t.start, t.stop + 1, msg));
    } else if (e instanceof NoViableAltException) {
      this.errors.push(
        new LexerOrParserError(
          line,
          e.startToken.start,
          e.startToken.stop + 1,
          msg
        )
      );
    } else {
      console.error("Don't know how to handle this error");
      throw new Error("Don't know how to handle this error");
    }
  };
}
