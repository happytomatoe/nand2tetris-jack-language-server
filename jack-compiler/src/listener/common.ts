import { SubroutineIdContext } from "../generated/JackParser";
import { LocalSymbolTable, VariableSymbol } from "../symbol";

export interface CallTypeResult {
  callType: CallType;
  subroutineIdText: string;
  symbol?: VariableSymbol;
}

export enum CallType {
  VarMethod = 1,
  LocalMethod = 2,
  ClassFunctionOrConstructor = 3,
}
export function getCallType(
  subroutineId: SubroutineIdContext,
  className: string,
  localSymbolTable: LocalSymbolTable
): CallTypeResult {
  if (subroutineId.DOT() == undefined) {
    //local method
    return {
      callType: CallType.LocalMethod,
      subroutineIdText:
        className + "." + (subroutineId.subroutineName()?.getText() ?? ""),
    } as CallTypeResult;
  } else {
    // var method
    const [varName, methodName] = subroutineId.getText().split(".");
    const symbol = localSymbolTable.lookup(varName);
    if (symbol != undefined) {
      return {
        callType: CallType.VarMethod,
        subroutineIdText: symbol.type + "." + methodName,
        symbol: symbol,
      } as CallTypeResult;
    } else {
      // class function/ctor
      return {
        callType: CallType.ClassFunctionOrConstructor,
        subroutineIdText: subroutineId.getText(),
      } as CallTypeResult;
    }
  }
}

export function assertExists<T>(
  val: T | undefined | null,
  message?: string
): T {
  if (val == null) {
    throw new Error(message ?? "Cannot be null or undefined");
  }
  return val;
}
