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
import { JackCompilerError, LexerOrParserError } from "../error";

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
      this.errors.push(new LexerOrParserError(line, t.start, t.stop + 1, msg));
    } else if (e instanceof NoViableAltException) {
      this.errors.push(
        new LexerOrParserError(
          line,
          e.startToken?.start ?? 0,
          (e.startToken?.stop ?? 0) + 1,
          msg
        )
      );
    } else {
      console.error("Don't know how to handle this error");
      throw new Error("Don't know how to handle this error");
    }
  }
  reportAmbiguity(
    recognizer: Parser,
    dfa: DFA,
    startIndex: number,
    stopIndex: number,
    exact: boolean,
    ambigAlts: BitSet | undefined,
    configs: ATNConfigSet
  ): void {}
  reportAttemptingFullContext(
    recognizer: Parser,
    dfa: DFA,
    startIndex: number,
    stopIndex: number,
    conflictingAlts: BitSet | undefined,
    configs: ATNConfigSet
  ): void {}
  reportContextSensitivity(
    recognizer: Parser,
    dfa: DFA,
    startIndex: number,
    stopIndex: number,
    prediction: number,
    configs: ATNConfigSet
  ): void {}
}
