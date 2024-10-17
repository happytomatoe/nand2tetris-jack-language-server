import {
  ANTLRErrorListener,
  ATNConfigSet,
  ATNSimulator,
  BitSet,
  DFA,
  LexerNoViableAltException,
  NoViableAltException,
  Parser,
  RecognitionException,
  Recognizer,
  Token,
} from "antlr4ng";
import { asSpan, JackCompilerError, LexerOrParserError } from "../error";
import { assertExists } from "./common";

export class CustomErrorListener implements ANTLRErrorListener {
  public errors: JackCompilerError[] = [];
  syntaxError<S extends Token, T extends ATNSimulator>(
    _recognizer: Recognizer<T>,
    offendingSymbol: S | null,
    line: number,
    _charPositionInLine: number,
    msg: string,
    e: RecognitionException | null
  ): void {
    if (offendingSymbol != null || (e != null && e.offendingToken != null)) {
      const t = offendingSymbol ?? (e?.offendingToken as Token);
      this.errors.push(
        LexerOrParserError(
          { line: line, start: t.start, end: t.stop + 1 },
          msg
        )
      );
    } else if (e instanceof NoViableAltException) {
      //theoretically we can't get this exception
      this.errors.push(
        LexerOrParserError(
          asSpan(
            assertExists(
              e.startToken ?? e.offendingToken,
              "Cant find start token for NoViableAltException"
            )
          ),
          msg
        )
      );
    } else if (e instanceof LexerNoViableAltException) {
      this.errors.push(
        LexerOrParserError(
          { line: line, start: e.startIndex, end: e.startIndex + 1 },
          msg
        )
      );
    } else {
      console.error("Don't know how to handle this error");
      throw new Error("Don't know how to handle this error ");
    }
  }

  reportAmbiguity(
    _recognizer: Parser,
    _dfa: DFA,
    _startIndex: number,
    _stopIndex: number,
    _exact: boolean,
    _ambigAlts: BitSet | undefined,
    _configs: ATNConfigSet
  ): void {}
  reportAttemptingFullContext(
    _recognizer: Parser,
    _dfa: DFA,
    _startIndex: number,
    _stopIndex: number,
    _conflictingAlts: BitSet | undefined,
    _configs: ATNConfigSet
  ): void {}
  reportContextSensitivity(
    _recognizer: Parser,
    _dfa: DFA,
    _startIndex: number,
    _stopIndex: number,
    _prediction: number,
    _configs: ATNConfigSet
  ): void {}
}
