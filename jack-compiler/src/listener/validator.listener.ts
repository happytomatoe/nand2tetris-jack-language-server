import { JackParserListener } from "../generated/JackParserListener";
import { builtInTypes, intRange } from "../builtins";
import {
  ConstructorMushReturnThis,
  DuplicatedVariableException,
  FieldCantBeReferencedInFunction,
  FilenameDoesntMatchClassName,
  FunctionCalledAsMethodError,
  IncorrectConstructorReturnType,
  IncorrectParamsNumberInSubroutineCallError,
  IntLiteralIsOutOfRange,
  JackCompilerError,
  MethodCalledAsFunctionError,
  NonVoidFunctionNoReturnError,
  SubroutineNotAllPathsReturnError,
  ThisCantBeReferencedInFunction,
  UndeclaredVariableError,
  UnknownClassError,
  UnknownSubroutineCallError,
  UnreachableCodeError,
  VoidSubroutineReturnsValueError,
  WrongLiteralTypeError,
} from "../error";
import {
  ClassDeclarationContext,
  ClassVarDecContext,
  ConstantContext,
  ElseStatementContext,
  IfStatementContext,
  LetStatementContext,
  ParameterContext,
  RBraceContext,
  ReturnStatementContext,
  StatementContext,
  SubroutineBodyContext,
  SubroutineCallContext,
  SubroutineDeclarationContext,
  SubroutineDecWithoutTypeContext,
  VarDeclarationContext,
  VarNameContext,
  VarTypeContext,
  WhileStatementContext,
} from "../generated/JackParser";
import {
  GenericSymbol,
  LocalSymbolTable,
  ScopeType,
  SubroutineType,
} from "../symbol";
import { assertExists, CallType, getCallType } from "./common";
import { ParserRuleContext } from "antlr4ng";
/**
 * Validates Jack file
 */
export class ValidatorListener extends JackParserListener {
  private localSymbolTable: LocalSymbolTable = new LocalSymbolTable();
  private subroutineShouldReturnVoidType = false;
  private controlFlowGraphNode: BinaryTreeNode = new BinaryTreeNode();
  private subroutineName = "";
  private className = "";
  private stopProcessingErrorsInThisScope = false;
  private subroutineType?: SubroutineType;
  constructor(
    private globalSymbolTable: Record<string, GenericSymbol>,
    private filename?: string,
    public errors: JackCompilerError[] = []
  ) {
    super();
  }

  override enterClassDeclaration = (ctx: ClassDeclarationContext) => {
    const className = ctx.className();
    const newName = className.getText();
    if (this.className != "") {
      throw new Error("Cannot change class name");
    }
    this.className = newName;
    if (this.filename != null && this.filename != this.className) {
      if (className.start == null) {
        throw new Error("Start token should not be null");
      }
      this.errors.push(
        new FilenameDoesntMatchClassName(
          className.start.line,
          className.start.start,
          className.start.stop,
          this.filename,
          this.className
        )
      );
    }
    ctx.localSymbolTable = this.localSymbolTable;
  };

  override enterClassVarDec = (ctx: ClassVarDecContext) => {
    let scope: ScopeType;
    if (ctx.STATIC() != null) {
      scope = ScopeType.Static;
    } else if (ctx.FIELD() != null) {
      scope = ScopeType.This;
    } else {
      throw new Error("Unknown field modifier ");
    }
    const type = ctx.fieldList().varType().getText();
    ctx
      .fieldList()
      .fieldName()
      .forEach((field) => {
        this.#localSymbolTableAdd(ctx, scope, field.getText(), type);
      });
  };
  override enterSubroutineDeclaration = (ctx: SubroutineDeclarationContext) => {
    if (ctx.subroutineType().CONSTRUCTOR() != null) {
      this.subroutineType = SubroutineType.Constructor;
      if (
        ctx.subroutineDecWithoutType().subroutineReturnType().getText() !==
        this.className
      ) {
        const start = assertExists(ctx.start, "Start token should not be null");
        this.#addError(
          new IncorrectConstructorReturnType(
            start.line,
            start.start,
            start.stop
          )
        );
      }
    } else if (ctx.subroutineType().FUNCTION() != null) {
      this.subroutineType = SubroutineType.Function;
    } else if (ctx.subroutineType().METHOD != null) {
      this.subroutineType = SubroutineType.Method;
    } else {
      throw new Error("Unknown subroutine type ");
    }
  };
  override enterSubroutineDecWithoutType = (
    ctx: SubroutineDecWithoutTypeContext
  ) => {
    const returnType = ctx.subroutineReturnType();
    this.subroutineShouldReturnVoidType = returnType.VOID() != null;
    this.controlFlowGraphNode = new BinaryTreeNode();
    this.subroutineName = ctx.subroutineName().getText();
  };

  override enterParameter = (ctx: ParameterContext) => {
    this.#defineArgument(
      ctx,
      ctx.parameterName().getText(),
      ctx.varType().getText(),
      this.subroutineType == SubroutineType.Method
    );
  };
  //Var
  override enterVarType = (ctx: VarTypeContext) => {
    if (ctx.IDENTIFIER() != null) {
      const type = ctx.IDENTIFIER()?.getText() ?? "";
      if (this.globalSymbolTable[type] == null) {
        const start = assertExists(ctx.start, "Start token should not be null");
        this.#addError(
          new UnknownClassError(start.line, start.start, start.stop, type)
        );
      }
    }
  };

  override enterVarDeclaration = (ctx: VarDeclarationContext) => {
    const type = ctx.varType().getText();
    ctx.varNameInDeclaration().forEach((name) => {
      this.#localSymbolTableAdd(ctx, ScopeType.Local, name.getText(), type);
    });
  };

  /**
   * Var name when doing some actions - do statement, let ... We have a different rule for a var name that is used in declaration
   */
  override enterVarName = (ctx: VarNameContext) => {
    const symbol = this.localSymbolTable.lookup(ctx.getText());
    if (symbol == undefined) {
      const start = assertExists(ctx.start, "Start token should not be null");

      this.#addError(
        new UndeclaredVariableError(
          start.line,
          start.start,
          start.stop,
          ctx.getText()
        )
      );
    } else if (
      this.subroutineType == SubroutineType.Function &&
      symbol.scope == ScopeType.This
    ) {
      const start = assertExists(ctx.start, "Start token should not be null");
      this.#addError(
        new FieldCantBeReferencedInFunction(start.line, start.start, start.stop)
      );
    }
  };

  override enterConstant = (ctx: ConstantContext) => {
    if (
      ctx.THIS_LITERAL() != null &&
      this.subroutineType == SubroutineType.Function
    ) {
      const start = assertExists(ctx.start, "Start token should not be null");

      this.#addError(
        new ThisCantBeReferencedInFunction(start.line, start.start, start.stop)
      );
    }
  };

  override enterStatement = (ctx: StatementContext) => {
    if (this.controlFlowGraphNode.returns == true) {
      const start = assertExists(ctx.start, "Start token should not be null");
      this.#addError(
        new UnreachableCodeError(
          start.line,
          start.start,
          ctx.stop?.stop ?? start.stop
        )
      );
      this.stopProcessingErrorsInThisScope = true;
    }
  };
  override enterRBrace = (_ctx: RBraceContext) => {
    this.stopProcessingErrorsInThisScope = false;
  };
  /**
   * Control flow
   */
  override enterWhileStatement = (_ctx: WhileStatementContext) => {
    this.controlFlowGraphNode = this.controlFlowGraphNode.left =
      new BinaryTreeNode(this.controlFlowGraphNode);
  };

  override exitWhileStatement = (_ctx: WhileStatementContext) => {
    if (this.controlFlowGraphNode?.parent != null) {
      this.controlFlowGraphNode = this.controlFlowGraphNode.parent;
    }
  };
  override enterIfStatement = (_ctx: IfStatementContext) => {
    this.controlFlowGraphNode = this.controlFlowGraphNode.left =
      new BinaryTreeNode(this.controlFlowGraphNode);
  };
  override exitIfStatement = (_ctx: IfStatementContext) => {
    if (this.controlFlowGraphNode?.parent != null) {
      this.controlFlowGraphNode = this.controlFlowGraphNode.parent;
    }
  };
  override enterElseStatement = (_ctx: ElseStatementContext) => {
    this.controlFlowGraphNode = this.controlFlowGraphNode.right =
      new BinaryTreeNode(this.controlFlowGraphNode);
  };
  override exitElseStatement = (_ctx: ElseStatementContext) => {
    if (this.controlFlowGraphNode?.parent != null) {
      this.controlFlowGraphNode = this.controlFlowGraphNode.parent;
    }
  };
  override enterLetStatement = (ctx: LetStatementContext) => {
    const varName = ctx.varName()?.getText();
    const constCtx = ctx.expression()?.constant();
    //corresponding literal type check
    if (
      varName != null &&
      constCtx != null &&
      this.localSymbolTable.lookup(varName) &&
      constCtx.NULL_LITERAL() == null
    ) {
      const symbol = this.localSymbolTable.lookup(varName);
      if (symbol != null && literalTypes.indexOf(symbol.type) != -1) {
        const type = symbol.type;
        const constantCtx = ctx.expression()?.constant();
        switch (type) {
          case "char":
          case "int":
            if (constantCtx?.INTEGER_LITERAL() === null) {
              const start = assertExists(
                ctx.start,
                "Start token should not be null"
              );
              this.#addError(
                new WrongLiteralTypeError(
                  start.line,
                  start.start,
                  start.stop,
                  type
                )
              );
            } else {
              const value = constantCtx?.INTEGER_LITERAL()?.getText();
              if (value != null && parseInt(value) > intRange.max) {
                const start = assertExists(
                  ctx.start,
                  "Start token should not be null"
                );
                this.#addError(
                  new IntLiteralIsOutOfRange(
                    start.line,
                    start.start,
                    start.stop,
                    parseInt(value),
                    intRange.min,
                    intRange.max
                  )
                );
              }
            }
            break;
          case "boolean":
            if (constantCtx?.booleanLiteral() === null) {
              const start = assertExists(
                ctx.start,
                "Start token should not be null"
              );
              this.#addError(
                new WrongLiteralTypeError(
                  start.line,
                  start.start,
                  start.stop,
                  type
                )
              );
            }
            break;
          case "String":
            if (constantCtx?.STRING_LITERAL() === null) {
              const start = assertExists(
                ctx.start,
                "Start token should not be null"
              );
              this.#addError(
                new WrongLiteralTypeError(
                  start.line,
                  start.start,
                  start.stop,
                  type.toLowerCase()
                )
              );
            }
            break;
          default:
            throw new Error(`Unknown literal type ${type}`);
        }
      }
    }
    //int min value check
    const unaryOp = ctx.expression()?.unaryOperation();
    if (
      varName &&
      unaryOp != null &&
      unaryOp.unaryOperator().MINUS() !== null &&
      unaryOp.expression()?.constant() != null &&
      unaryOp.expression()?.constant()?.INTEGER_LITERAL() !== null
    ) {
      const value = parseInt(
        unaryOp.expression()?.constant()?.INTEGER_LITERAL()?.getText() ?? "0"
      );
      if (-value < intRange.min) {
        const start = assertExists(ctx.start, "Start token should not be null");
        this.#addError(
          new IntLiteralIsOutOfRange(
            start.line,
            start.start,
            start.stop,
            value,
            intRange.min,
            intRange.max
          )
        );
      }
    }
  };

  override enterSubroutineCall = (ctx: SubroutineCallContext) => {
    //check if variable exists with the name before dot
    const subroutineId = ctx.subroutineId();
    const { callType, subroutineIdText } = getCallType(
      subroutineId,
      this.className,
      this.localSymbolTable
    );

    const symbol = this.globalSymbolTable[subroutineIdText];
    if (symbol == undefined) {
      const start = assertExists(ctx.start, "Start token should not be null");

      this.#addError(
        new UnknownSubroutineCallError(
          start.line,
          start.start,
          start.stop,
          subroutineId.subroutineName()?.getText() ?? "",
          subroutineId.className()?.getText() ?? ""
        )
      );
    } else {
      //method called as a function
      if (
        symbol.subroutineInfo?.type == SubroutineType.Method &&
        callType == CallType.ClassFunctionOrConstructor
      ) {
        const start = assertExists(ctx.start, "Start token should not be null");

        this.#addError(
          new MethodCalledAsFunctionError(
            start.line,
            start.start,
            start.stop,
            subroutineId.subroutineName()?.getText() ?? ""
          )
        );
      }
      // function called as a method
      else if (
        symbol.subroutineInfo?.type == SubroutineType.Function &&
        callType == CallType.LocalMethod
      ) {
        const start = assertExists(ctx.start, "Start token should not be null");

        this.#addError(
          new FunctionCalledAsMethodError(
            start.line,
            start.start,
            start.stop,
            subroutineId.subroutineName()?.getText() ?? ""
          )
        );
      } else {
        //check parameter count
        const l = ctx.expressionList()?.expression().length;
        if (symbol.subroutineInfo?.paramNames.length != l) {
          if (symbol.subroutineInfo == null)
            throw new Error("Subroutine info cannot be null");
          if (
            ctx.expressionList() != null &&
            ctx.expressionList().start != null
          ) {
            const exprList = ctx.expressionList();
            const start = assertExists(
              exprList.start,
              "Start token should not be null"
            );

            this.#addError(
              new IncorrectParamsNumberInSubroutineCallError(
                start.line,
                start.start,
                (exprList.stop?.stop ?? start.stop) + 1,
                subroutineId.getText(),
                symbol.subroutineInfo?.paramNames.length ?? 0,
                l
              )
            );
          } else {
            const start = assertExists(
              ctx.start,
              "Start token should not be null"
            );

            this.#addError(
              new IncorrectParamsNumberInSubroutineCallError(
                start.line,
                start.start,
                start.stop,
                subroutineId.getText(),
                symbol.subroutineInfo?.paramNames.length ?? 0,
                l
              )
            );
          }
        }
      }
    }
  };
  override enterReturnStatement = (ctx: ReturnStatementContext) => {
    const returnsVoid = ctx.expression() == null;
    if (returnsVoid && !this.subroutineShouldReturnVoidType) {
      const stop = getStopToken(ctx);
      this.#addError(
        new NonVoidFunctionNoReturnError(stop.line, stop.start, stop.stop)
      );
    }
    if (!returnsVoid && this.subroutineShouldReturnVoidType) {
      const stop = getStopToken(ctx);
      this.#addError(
        new VoidSubroutineReturnsValueError(stop.line, stop.start, stop.stop)
      );
    }
    this.controlFlowGraphNode.returns = true;
    if (this.subroutineType == SubroutineType.Constructor) {
      if (
        returnsVoid ||
        (ctx.expression()?.expression().length ?? 0) > 1 ||
        ctx.expression()?.constant() == null ||
        ctx.expression()?.constant()?.THIS_LITERAL() == null
      ) {
        const stop = getStopToken(ctx);
        this.#addError(
          new ConstructorMushReturnThis(stop.line, stop.start, stop.stop)
        );
      }
    }
  };

  override exitSubroutineBody = (ctx: SubroutineBodyContext) => {
    if (!this.controlFlowGraphNode.returns) {
      const stop = getStopToken(ctx);
      this.#addError(
        new SubroutineNotAllPathsReturnError(
          stop.line,
          stop.start,
          stop.stop,
          this.subroutineName
        )
      );
    }
    this.subroutineType = undefined;
  };
  override exitSubroutineDeclaration = (ctx: SubroutineDeclarationContext) => {
    ctx.symbols = this.localSymbolTable.popStack();
  };

  override exitClassDeclaration = (_ctx: ClassDeclarationContext) => {
    while (this.controlFlowGraphNode?.parent != undefined) {
      this.controlFlowGraphNode = this.controlFlowGraphNode.parent;
    }
  };

  //Utils
  #defineArgument(
    ctx: ParserRuleContext,
    name: string,
    type: string,
    inMethod: boolean
  ) {
    if (this.localSymbolTable.lookup(name)) {
      const start = assertExists(ctx.start, "Start token should not be null");

      this.#addError(
        new DuplicatedVariableException(
          start.line,
          start.start,
          start.stop,
          name
        )
      );
    } else {
      this.localSymbolTable.defineArgument(name, type, inMethod);
    }
  }
  #localSymbolTableAdd(
    ctx: ParserRuleContext,
    scope: ScopeType,
    name: string,
    type: string
  ) {
    if (this.localSymbolTable.lookup(name)) {
      const start = assertExists(ctx.start, "Start token should not be null");

      this.#addError(
        new DuplicatedVariableException(
          start.line,
          start.start,
          start.stop,
          name
        )
      );
    } else {
      this.localSymbolTable.define(scope, name, type);
    }
  }
  #addError<T extends JackCompilerError>(error: T) {
    if (!this.stopProcessingErrorsInThisScope) this.errors.push(error);
  }
}

class BinaryTreeNode {
  private _returns?: boolean;
  constructor(
    public parent?: BinaryTreeNode,
    public left?: BinaryTreeNode,
    public right?: BinaryTreeNode
  ) {}

  public get returns(): boolean {
    if (this._returns) {
      return this._returns;
    } else if (this.right == undefined && this.left == undefined) {
      return false;
    } else if (this.right != undefined && this.left != undefined) {
      return this.left.returns && this.right.returns;
    } else if (this.left != undefined) {
      return false;
    } else {
      throw new Error("Something went wrong - CFG has only right  subtree");
    }
  }

  public set returns(_returns: boolean) {
    this._returns = _returns;
  }
  print() {
    console.log("Branch returns value");
    console.log(".");
    console.log(this.printBT());
  }

  printBT(prefix = "", side: Side = Side.LEFT) {
    let res = "";
    if (this._returns) {
      res += this.#pad(side);
      res += " " + this._returns + "\n";
      return res;
    } else {
      if (this.right == undefined && this.left == undefined) {
        res += this.#pad(side);
        res += " " + false + "\n";
      } else {
        res += this.left?.printBT(
          side == Side.LEFT ? "|   " : "    ",
          Side.LEFT
        );
        if (this.right) {
          res += prefix;
          res += this.right?.printBT(
            side == Side.LEFT ? "|\t" : "\t",
            Side.RIGHT
          );
        } else {
          res += "\n";
        }
      }
    }
    return res;
  }
  #pad(side: Side): string {
    return side == Side.LEFT ? "├──" : "└──";
  }
}
enum Side {
  LEFT,
  RIGHT,
}
const literalTypes = [...builtInTypes, "String"];

function getStopToken(ctx: ParserRuleContext) {
  const stop = ctx.stop;
  if (stop == null) throw new Error("Last token cannot be null");
  return stop;
}
