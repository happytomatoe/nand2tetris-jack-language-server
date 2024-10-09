import {
  ClassDeclarationContext,
  SubroutineBodyContext,
  SubroutineDeclarationContext,
  VarNameInDeclarationContext,
} from "../generated/JackParser";
import { DuplicatedClassError, DuplicatedSubroutineError } from "../error";
import { builtInSymbols, builtInTypes } from "../builtins";
import {
  GenericSymbol,
  GlobalSymbolTable,
  SubroutineInfo,
  SubroutineType,
} from "../symbol";
import JackParserListener from "../generated/JackParserListener";

const primitives = new Set(builtInTypes);
export type Primitive = typeof primitives extends Set<infer S> ? S : never;
/* eslint-disable  @typescript-eslint/no-non-null-assertion */
/**
 * Creates global symbol table that contains built-in functions and found classes and subroutines
 */
export class BinderListener extends JackParserListener {
  // key can be class or <class>.<subroutine_name>
  public globalSymbolTable: GlobalSymbolTable = structuredClone(builtInSymbols);
  public className = "";
  public errors: DuplicatedSubroutineError[] = [];
  private subRoutineInfo: SubroutineInfo = {} as SubroutineInfo;
  private subroutineVarsCount = 0;
  private stopProcessingSubroutines = false;
  private subroutineId = "";

  override enterClassDeclaration = (ctx: ClassDeclarationContext) => {
    const id = ctx.className()!.IDENTIFIER();
    const className = id.getText();
    if (this.globalSymbolTable[className] != undefined) {
      const e = new DuplicatedClassError(
        ctx.className()!.start.line,
        ctx.className()!.start.start,
        ctx.className()!.stop!.stop + 1,
        className,
      );
      this.errors.push(e);
      return;
    }
    this.globalSymbolTable[className] = {} as GenericSymbol;
    this.className = className;
  };

  override enterSubroutineDeclaration = (ctx: SubroutineDeclarationContext) => {
    let subroutineType: SubroutineType;
    if (ctx.subroutineType().CONSTRUCTOR() != null) {
      subroutineType = SubroutineType.Constructor;
    } else if (ctx.subroutineType().METHOD() != null) {
      subroutineType = SubroutineType.Method;
    } else if (ctx.subroutineType().FUNCTION() != null) {
      subroutineType = SubroutineType.Function;
    } else {
      throw new Error("Invalid subroutine type");
    }
    const subroutineWithoutTypeCtx = ctx.subroutineDecWithoutType();
    const nameCtx = subroutineWithoutTypeCtx.subroutineName();
    const subroutineName = nameCtx.IDENTIFIER().getText();
    const id = this.className + "." + subroutineName;
    if (this.globalSymbolTable[id] != undefined) {
      this.errors.push(
        new DuplicatedSubroutineError(
          nameCtx.IDENTIFIER().symbol.line,
          nameCtx.start.start,
          nameCtx.start.stop,
          subroutineName,
        ),
      );
      this.stopProcessingSubroutines = true;
    } else {
      this.subroutineId = id;
      const paramsCount = subroutineWithoutTypeCtx
        .parameterList()
        .parameter_list().length;
      this.subRoutineInfo = {
        type: subroutineType,
        paramsCount: paramsCount,
      };
      this.subroutineVarsCount = 0;
      this.stopProcessingSubroutines = false;
    }
  };
  override enterVarNameInDeclaration = (_ctx: VarNameInDeclarationContext) => {
    if (this.stopProcessingSubroutines) return;
    this.subroutineVarsCount++;
  };
  override exitSubroutineBody = (_ctx: SubroutineBodyContext) => {
    if (this.stopProcessingSubroutines) return;
    this.subRoutineInfo.localVarsCount = this.subroutineVarsCount;
    this.globalSymbolTable[this.subroutineId] = {
      subroutineInfo: this.subRoutineInfo,
    };
  };
}
