import { TerminalNode } from "antlr4ng";
import { builtInTypes, intRange } from "../builtins";
import {
  asSpan,
  ConstructorMushReturnThisError,
  DuplicatedVariableError,
  FieldCantBeReferencedInFunctionError,
  FilenameDoesntMatchClassNameError,
  FunctionCalledAsMethodError,
  IncorrectConstructorReturnTypeError,
  IncorrectParamsNumberInSubroutineCallError,
  IntLiteralIsOutOfRangeError,
  JackCompilerError,
  MethodCalledAsFunctionError,
  NonVoidFunctionNoReturnError,
  SubroutineNotAllPathsReturnError,
  ThisCantBeReferencedInFunctionError,
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
  FieldNameContext,
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
  VarNameInDeclarationContext,
  VarTypeContext,
  WhileStatementContext,
} from "../generated/JackParser";
import { JackParserListener } from "../generated/JackParserListener";
import {
  GenericSymbol,
  LocalSymbolTable,
  ScopeType,
  SubroutineType,
} from "../symbol";
import { assertExists, CallType, getCallType } from "./common";
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
        FilenameDoesntMatchClassNameError(
          asSpan(assertExists(ctx.start)),
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
      .forEach((field: FieldNameContext) => {
        this.localSymbolTableAdd(
          field.IDENTIFIER(),
          scope,
          field.getText(),
          type
        );
      });
  };
  override enterSubroutineDeclaration = (ctx: SubroutineDeclarationContext) => {
    if (ctx.subroutineType().CONSTRUCTOR() != null) {
      this.subroutineType = SubroutineType.Constructor;
      if (
        ctx.subroutineDecWithoutType().subroutineReturnType().getText() !==
        this.className
      ) {
        this.addError(
          IncorrectConstructorReturnTypeError(asSpan(assertExists(ctx.start)))
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
    const name = ctx.parameterName().getText();
    if (this.localSymbolTable.lookup(name)) {
      this.addError(
        DuplicatedVariableError(asSpan(assertExists(ctx.start)), name)
      );
    } else {
      this.localSymbolTable.defineArgument(
        name,
        ctx.varType().getText(),
        this.subroutineType == SubroutineType.Method
      );
    }
  };
  //Var
  override enterVarType = (ctx: VarTypeContext) => {
    if (ctx.IDENTIFIER() != null) {
      const type = ctx.IDENTIFIER()?.getText() ?? "";
      if (this.globalSymbolTable[type] == null) {
        //TODO: check if we need to add ctx.stop to other exceptions
        this.addError(UnknownClassError(asSpan(assertExists(ctx.start), ctx.stop ?? ctx.start), type));
      }
    }
  };

  override enterVarDeclaration = (ctx: VarDeclarationContext) => {
    const type = ctx.varType().getText();
    ctx
      .varNameInDeclaration()
      .forEach((nameCtx: VarNameInDeclarationContext) => {
        this.localSymbolTableAdd(
          nameCtx.IDENTIFIER(),
          ScopeType.Local,
          nameCtx.getText(),
          type
        );
      });
  };

  /**
   * Var name when doing some actions - do statement, let ... We have a different rule for a var name that is used in declaration
   */
  override enterVarName = (ctx: VarNameContext) => {
    const symbol = this.localSymbolTable.lookup(ctx.getText());
    if (symbol == undefined) {
      this.addError(
        UndeclaredVariableError(asSpan(assertExists(ctx.start)), ctx.getText())
      );
    } else if (
      this.subroutineType == SubroutineType.Function &&
      symbol.scope == ScopeType.This
    ) {
      this.addError(
        FieldCantBeReferencedInFunctionError(asSpan(assertExists(ctx.start)))
      );
    }
  };

  override enterConstant = (ctx: ConstantContext) => {
    if (
      ctx.THIS_LITERAL() != null &&
      this.subroutineType == SubroutineType.Function
    ) {
      this.addError(
        ThisCantBeReferencedInFunctionError(asSpan(assertExists(ctx.start)))
      );
    }
  };

  override enterStatement = (ctx: StatementContext) => {
    if (this.controlFlowGraphNode.returns == true) {
      this.addError(
        UnreachableCodeError(asSpan(assertExists(ctx.start), ctx.stop))
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
              this.addError(
                WrongLiteralTypeError(asSpan(assertExists(ctx.start)), type)
              );
            } else {
              const value = constantCtx?.INTEGER_LITERAL()?.getText();
              if (value != null && parseInt(value) > intRange.max) {
                this.addError(
                  IntLiteralIsOutOfRangeError(
                    asSpan(assertExists(ctx.start)),
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
              this.addError(
                WrongLiteralTypeError(asSpan(assertExists(ctx.start)), type)
              );
            }
            break;
          case "String":
            if (constantCtx?.STRING_LITERAL() === null) {
              this.addError(
                WrongLiteralTypeError(
                  asSpan(assertExists(ctx.start)),
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
        this.addError(
          IntLiteralIsOutOfRangeError(
            asSpan(assertExists(ctx.start)),
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
      this.addError(
        UnknownSubroutineCallError(
          asSpan(assertExists(ctx.start)),
          subroutineId.subroutineName().getText(),
          subroutineId.className()?.getText()
        )
      );
    } else {
      //method called as a function
      if (
        symbol.subroutineInfo?.type == SubroutineType.Method &&
        callType == CallType.ClassFunctionOrConstructor
      ) {
        this.addError(
          MethodCalledAsFunctionError(
            asSpan(assertExists(ctx.start)),
            subroutineId.subroutineName().getText()
          )
        );
      }
      // function called as a method
      else if (
        symbol.subroutineInfo?.type == SubroutineType.Function &&
        callType == CallType.LocalMethod
      ) {
        this.addError(
          FunctionCalledAsMethodError(
            asSpan(assertExists(ctx.start)),
            subroutineId.subroutineName().getText()
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
            this.addError(
              IncorrectParamsNumberInSubroutineCallError(
                asSpan(assertExists(ctx.start)),
                subroutineId.getText(),
                assertExists(symbol.subroutineInfo).paramNames.length,
                l
              )
            );
          } else {
            this.addError(
              IncorrectParamsNumberInSubroutineCallError(
                asSpan(assertExists(ctx.start)),
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
      this.addError(
        NonVoidFunctionNoReturnError(
          asSpan(assertExists(ctx.stop ?? ctx.start))
        )
      );
    }
    if (!returnsVoid && this.subroutineShouldReturnVoidType) {
      this.addError(
        VoidSubroutineReturnsValueError(asSpan(assertExists(ctx.start)))
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
        this.addError(
          ConstructorMushReturnThisError(
            asSpan(assertExists(ctx.stop ?? ctx.start))
          )
        );
      }
    }
  };

  override exitSubroutineBody = (ctx: SubroutineBodyContext) => {
    if (!this.controlFlowGraphNode.returns) {
      this.addError(
        SubroutineNotAllPathsReturnError(
          asSpan(assertExists(ctx.stop ?? ctx.start)),
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

  localSymbolTableAdd(
    identifierCtx: TerminalNode,
    scope: ScopeType,
    name: string,
    type: string
  ) {
    if (this.localSymbolTable.lookup(name)) {
      this.addError(
        DuplicatedVariableError(asSpan(identifierCtx.symbol), name)
      );
    } else {
      this.localSymbolTable.define(scope, name, type);
    }
  }
  addError<T extends JackCompilerError>(error: T) {
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
