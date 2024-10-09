import { CommonTokenStream, TerminalNode, Token } from "antlr4";
import JackParser, {
  ArrayAccessContext,
  BinaryOperatorContext,
  BooleanLiteralContext,
  ClassDeclarationContext,
  ClassVarDecContext,
  ConstantContext,
  DoStatementContext,
  ElseStatementContext,
  ExpressionContext,
  ExpressionListContext,
  FieldListContext,
  FieldNameContext,
  GroupedExpressionContext,
  IfElseStatementContext,
  IfExpressionContext,
  IfStatementContext,
  LetStatementContext,
  ParameterContext,
  ParameterListContext,
  ProgramContext,
  RBraceContext,
  ReturnStatementContext,
  StatementContext,
  StatementsContext,
  SubroutineBodyContext,
  SubroutineCallContext,
  SubroutineDeclarationContext,
  SubroutineIdContext,
  SubroutineTypeContext,
  UnaryOperationContext,
  UnaryOperatorContext,
  VarDeclarationContext,
  VarNameContext,
  VarTypeContext,
  WhileExpressionContext,
  WhileStatementContext,
} from "jack-compiler/out/generated/JackParser";
import JackParserVisitor from "jack-compiler/out/generated/JackParserVisitor";
import { Doc, doc } from "prettier";
import { builders } from "prettier/doc";
const { join, hardline, indent, group } = doc.builders;
export class JackVisitor extends JackParserVisitor<Doc> {
  private indentationLevel = 0;
  private indentationLevelChange = 1;
  private onStartOfTheFile = true;
  constructor(private tokenStream: CommonTokenStream) {
    super();
  }
  visitProgram = (ctx: ProgramContext): builders.Doc => {
    return [this.visitClassDeclaration(ctx.classDeclaration()), hardline];
  };

  //	CLASS className LBRACE classVarDec* subroutineDeclaration* rBrace;
  visitClassDeclaration = (ctx: ClassDeclarationContext): builders.Doc => {
    return [
      group([
        this.visitTerminal(ctx.CLASS()),
        " ",
        this.visitTerminal(ctx.className().IDENTIFIER()),
        " ",
        this.visitTerminal(ctx.LBRACE()),
      ]),
      [
        ctx
          .classVarDec_list()
          .map((v) => this.addHardLine(this.visitClassVarDec(v))),
        ctx
          .subroutineDeclaration_list()
          .map((v) => this.addHardLine(this.visitSubroutineDeclaration(v))),
        this.visitRBrace(ctx.rBrace()),
      ],
    ];
  };

  // classVarDec: (STATIC | FIELD) fieldList SEMICOLON;
  visitClassVarDec = (ctx: ClassVarDecContext): builders.Doc => {
    let staticOrField: Doc | undefined;
    if (ctx.STATIC() != null) {
      staticOrField = this.visitTerminal(ctx.STATIC());
    } else if (ctx.FIELD() != null) {
      staticOrField = this.visitTerminal(ctx.FIELD());
    } else {
      throw new Error("Invalid qualifier for class variable " + ctx.getText());
    }
    return [
      staticOrField,
      " ",
      this.visitFieldList(ctx.fieldList()),
      this.visitTerminal(ctx.SEMICOLON()),
    ];
  };
  // fieldList: varType fieldName ( COMMA fieldName)*;
  visitFieldList = (ctx: FieldListContext): doc.builders.Doc => {
    const varNames = joinWithCommas(
      ctx.fieldName_list().map((v) => [this.visitFieldName(v)])
    );
    return [this.visitVarType(ctx.varType()), " ", varNames];
  };
  visitFieldName = (ctx: FieldNameContext): Doc => {
    return this.visitTerminal(ctx.IDENTIFIER());
  };

  // subroutineDeclaration: subroutineType subroutineDecWithoutType;
  // subroutineType: CONSTRUCTOR | METHOD | FUNCTION;
  // subroutineDecWithoutType:
  // 	subroutineReturnType subroutineName LPAREN parameterList RPAREN subroutineBody;
  visitSubroutineDeclaration = (
    ctx: SubroutineDeclarationContext
  ): builders.Doc => {
    const subroutineDecWithoutType = ctx.subroutineDecWithoutType();

    const bodyContext: SubroutineBodyContext =
      subroutineDecWithoutType.subroutineBody();
    const res: Doc = [
      group([
        this.visitSubroutineType(ctx.subroutineType()),
        " ",
        subroutineDecWithoutType.subroutineReturnType().getText(),
        " ",
        subroutineDecWithoutType.subroutineName().getText(),
        this.visitTerminal(subroutineDecWithoutType.LPAREN()),
        this.visitParameterList(subroutineDecWithoutType.parameterList()),
        this.visitTerminal(subroutineDecWithoutType.RPAREN()),
        " ",
        this.visitTerminal(bodyContext.LBRACE()),
      ]),
      // subroutineBody: LBRACE varDeclaration* statements rBrace;
      bodyContext
        .varDeclaration_list()
        .map((v) => this.addHardLine(this.visitVarDeclaration(v))),
      this.visitStatements(bodyContext.statements()),
    ];
    res.push(this.visitRBrace(bodyContext.rBrace()));
    return res;
  };

  visitSubroutineType = (ctx: SubroutineTypeContext): builders.Doc => {
    if (ctx.CONSTRUCTOR() != null) {
      return this.visitTerminal(ctx.CONSTRUCTOR());
    } else if (ctx.FUNCTION() != null) {
      return this.visitTerminal(ctx.FUNCTION());
    } else if (ctx.METHOD() != null) {
      return this.visitTerminal(ctx.METHOD());
    }
    throw new Error("Invalid subroutine type " + ctx.getText());
  };
  visitParameterList = (ctx: ParameterListContext): builders.Doc => {
    return joinWithCommas(
      ctx.parameter_list().map((v) => this.visitParameter(v))
    );
  };

  //varType parameterName
  visitParameter = (ctx: ParameterContext): builders.Doc => {
    return join(" ", [
      this.visitVarType(ctx.varType()),
      ctx.parameterName().getText(),
    ]);
  };
  visitVarType = (ctx: VarTypeContext): doc.builders.Doc => {
    const arr = [ctx.BOOLEAN(), ctx.INT(), ctx.IDENTIFIER(), ctx.CHAR()];
    const elem = arr.find((el) => el !== null);
    if (elem) {
      return this.visitTerminal(elem);
    }
    throw new Error("Invalid variable type " + ctx.getText());
  };
  // VAR varType varNameInDeclaration (COMMA varNameInDeclaration)* SEMICOLON;
  visitVarDeclaration = (ctx: VarDeclarationContext): builders.Doc => {
    return group([
      this.visitTerminal(ctx.VAR()),
      " ",
      this.visitVarType(ctx.varType()),
      " ",
      joinWithCommas(
        ctx.varNameInDeclaration_list().map((v) => this.visitVarName(v))
      ),
      this.visitTerminal(ctx.SEMICOLON()),
    ]);
  };
  visitVarName = (ctx: VarNameContext): builders.Doc => {
    return this.visitTerminal(ctx.IDENTIFIER());
  };
  visitStatements = (ctx: StatementsContext): builders.Doc[] => {
    return ctx
      .statement_list()
      .map((v) => this.addHardLine(this.visitStatement(v)));
  };
  //
  visitStatement = (ctx: StatementContext): builders.Doc => {
    /**
		 * statement:
			letStatement
			| ifElseStatement
			| whileStatement
			| doStatement
			| returnStatement;

		 */
    if (ctx.letStatement() != null) {
      return this.visitLetStatement(ctx.letStatement());
    } else if (ctx.ifElseStatement() != null) {
      return this.visitIfElseStatement(ctx.ifElseStatement());
    } else if (ctx.whileStatement() != null) {
      return this.visitWhileStatement(ctx.whileStatement());
    } else if (ctx.doStatement() != null) {
      return this.visitDoStatement(ctx.doStatement());
    } else if (ctx.returnStatement() != null) {
      return this.visitReturnStatement(ctx.returnStatement());
    } else {
      throw new Error("Unknown statement type: " + ctx.getText());
    }
  };
  // LET (varName | arrayAccess) equals expression SEMICOLON;
  visitLetStatement = (ctx: LetStatementContext): builders.Doc => {
    let leftSide: Doc = "";
    if (ctx.varName() != null) {
      leftSide = this.visitVarName(ctx.varName());
    } else if (ctx.arrayAccess() != null) {
      leftSide = this.visitArrayAccess(ctx.arrayAccess());
    } else {
      throw new Error("Unknown left side in let " + ctx.getText());
    }
    return group([
      this.visitTerminal(ctx.LET()),
      " ",
      leftSide,
      " ",
      this.visitTerminal(ctx.equals().EQUALS()),
      " ",
      this.visitExpression(ctx.expression()),
      this.visitTerminal(ctx.SEMICOLON()),
    ]);
  };
  // ifElseStatement: ifStatement elseStatement?;
  visitIfElseStatement = (ctx: IfElseStatementContext): builders.Doc => {
    return [
      this.visitIfStatement(ctx.ifStatement()),
      ctx.elseStatement() != null
        ? this.visitElseStatement(ctx.elseStatement())
        : "",
    ];
  };
  //ifStatement
  // IF LPAREN ifExpression RPAREN LBRACE statements rBrace;
  visitIfStatement = (ctx: IfStatementContext): builders.Doc => {
    return [
      this.visitTerminal(ctx.IF()),
      " ",
      this.visitTerminal(ctx.LPAREN()),
      this.visitIfExpression(ctx.ifExpression()),
      this.visitTerminal(ctx.RPAREN()),
      " ",
      this.visitTerminal(ctx.LBRACE()),
      this.visitStatements(ctx.statements()),
      this.visitRBrace(ctx.rBrace()),
    ];
  };
  // ifExpression: expression;
  visitIfExpression = (ctx: IfExpressionContext): builders.Doc => {
    return this.visitExpression(ctx.expression());
  };
  //elseStatement: ELSE LBRACE statements rBrace;
  visitElseStatement = (ctx: ElseStatementContext): builders.Doc => {
    return [
      " ",
      this.visitTerminal(ctx.ELSE()),
      " ",
      this.visitTerminal(ctx.LBRACE()),
      this.visitStatements(ctx.statements()),
      this.visitRBrace(ctx.rBrace()),
    ];
  };

  // 	WHILE LPAREN whileExpression RPAREN LBRACE statements rBrace;
  visitWhileStatement = (ctx: WhileStatementContext): builders.Doc => {
    return [
      this.visitTerminal(ctx.WHILE()),
      " ",
      this.visitTerminal(ctx.LPAREN()),
      this.visitWhileExpression(ctx.whileExpression()),
      this.visitTerminal(ctx.RPAREN()),
      " ",
      this.visitTerminal(ctx.LBRACE()),
      this.visitStatements(ctx.statements()),
      this.visitRBrace(ctx.rBrace()),
    ];
  };
  //whileExpression: expression;
  visitWhileExpression = (ctx: WhileExpressionContext): builders.Doc => {
    return this.visitExpression(ctx.expression());
  };
  // 	doStatement: DO subroutineCall SEMICOLON;
  visitDoStatement = (ctx: DoStatementContext): builders.Doc => {
    return [
      this.visitTerminal(ctx.DO()),
      " ",
      this.visitSubroutineCall(ctx.subroutineCall()),
      this.visitTerminal(ctx.SEMICOLON()),
    ];
  };
  // 	subroutineCall: subroutineId LPAREN expressionList RPAREN;
  visitSubroutineCall = (ctx: SubroutineCallContext): builders.Doc => {
    return [
      this.visitSubroutineId(ctx.subroutineId()),
      this.visitTerminal(ctx.LPAREN()),
      this.visitExpressionList(ctx.expressionList()),
      this.visitTerminal(ctx.RPAREN()),
    ];
  };
  // 	subroutineId: ((className | THIS_LITERAL) DOT)? subroutineName;
  visitSubroutineId = (ctx: SubroutineIdContext): builders.Doc => {
    let classNameOrThis: Doc | undefined = undefined;
    if (ctx.className() != null) {
      classNameOrThis = this.visitTerminal(ctx.className().IDENTIFIER());
    } else if (ctx.THIS_LITERAL() != null) {
      classNameOrThis = this.visitTerminal(ctx.THIS_LITERAL());
    }
    return [
      classNameOrThis != null
        ? [classNameOrThis, this.visitTerminal(ctx.DOT())]
        : "",
      this.visitTerminal(ctx.subroutineName().IDENTIFIER()),
    ];
  };
  //returnStatement: RETURN expression? SEMICOLON;
  visitReturnStatement = (ctx: ReturnStatementContext): builders.Doc => {
    return [
      this.visitTerminal(ctx.RETURN()),
      ctx.expression() != null
        ? [" ", this.visitExpression(ctx.expression())]
        : "",
      this.visitTerminal(ctx.SEMICOLON()),
    ];
  };

  // expressionList: (expression (COMMA expression)*)?;
  visitExpressionList = (ctx: ExpressionListContext): builders.Doc => {
    return joinWithCommas(
      ctx.expression_list().map((v) => this.visitExpression(v))
    );
  };

  visitExpression = (ctx: ExpressionContext): builders.Doc => {
    //expression:
    // constant
    // | varName
    // | subroutineCall
    // | arrayAccess
    // | unaryOperation
    // | expression binaryOperator expression
    // | groupedExpression;
    if (ctx.constant() != null) {
      return this.visitConstant(ctx.constant());
    } else if (ctx.varName() != null) {
      return this.visitTerminal(ctx.varName().IDENTIFIER());
    } else if (ctx.subroutineCall() != null) {
      return this.visitSubroutineCall(ctx.subroutineCall());
    } else if (ctx.arrayAccess() != null) {
      return this.visitArrayAccess(ctx.arrayAccess());
    } else if (ctx.unaryOperation() != null) {
      return this.visitUnaryOperation(ctx.unaryOperation());
    } else if (ctx.binaryOperator() != null) {
      const op1 = this.visitExpression(ctx.expression(0));
      const binaryOp = this.visitBinaryOperator(ctx.binaryOperator());
      const t = ctx.expression(1);
      const op2 = this.visitExpression(t);
      return join(" ", [op1, binaryOp, op2]);
    } else if (ctx.groupedExpression() != null) {
      return this.visitGroupedExpression(ctx.groupedExpression());
    }
    throw new Error("Unknown expression " + ctx.getText());
  };
  visitBinaryOperator = (ctx: BinaryOperatorContext): doc.builders.Doc => {
    return this.visitTerminalOrThrow(
      () => "Invalid variable type " + ctx.getText(),
      ctx.AND(),
      ctx.OR(),
      ctx.DIV(),
      ctx.EQUALS(),
      ctx.GREATER_THAN(),
      ctx.LESS_THAN(),
      ctx.MINUS(),
      ctx.MUL(),
      ctx.PLUS()
    );
  };
  visitTerminalOrThrow(
    errorMsg: () => string,
    ...args: TerminalNode[]
  ): doc.builders.Doc {
    const elem = args.find((el) => el !== null);
    if (elem) {
      return this.visitTerminal(elem);
    }
    throw new Error(errorMsg());
  }
  //constant:
  // INTEGER_LITERAL
  // | STRING_LITERAL
  // | booleanLiteral
  // | NULL_LITERAL
  // | THIS_LITERAL;
  visitConstant = (ctx: ConstantContext): builders.Doc => {
    if (ctx.booleanLiteral() != null) {
      return this.visitBooleanLiteral(ctx.booleanLiteral());
    }
    return this.visitTerminalOrThrow(
      () => "Invalid constant `" + ctx.getText() + "`",
      ctx.INTEGER_LITERAL(),
      ctx.STRING_LITERAL(),
      ctx.NULL_LITERAL(),
      ctx.THIS_LITERAL()
    );
  };
  visitBooleanLiteral = (ctx: BooleanLiteralContext): doc.builders.Doc => {
    if (ctx.TRUE() != null) {
      return this.visitTerminal(ctx.TRUE());
    } else if (ctx.FALSE() != null) {
      return this.visitTerminal(ctx.FALSE());
    }
    throw new Error(`Invalid boolean  literal \`${ctx.getText()}\``);
  };

  // arrayAccess: varName LBRACKET expression RBRACKET;
  visitArrayAccess = (ctx: ArrayAccessContext): builders.Doc => {
    return [
      this.visitTerminal(ctx.varName().IDENTIFIER()),
      this.visitTerminal(ctx.LBRACKET()),
      this.visitExpression(ctx.expression()),
      this.visitTerminal(ctx.RBRACKET()),
    ];
  };
  visitUnaryOperation = (ctx: UnaryOperationContext): builders.Doc => {
    return [
      this.visitUnaryOperator(ctx.unaryOperator()),
      this.visitExpression(ctx.expression()),
    ];
  };
  visitUnaryOperator = (ctx: UnaryOperatorContext): doc.builders.Doc => {
    return this.visitTerminalOrThrow(
      () => "Invalid unary operator " + ctx.getText(),
      ctx.MINUS(),
      ctx.TILDE()
    );
  };
  visitGroupedExpression = (ctx: GroupedExpressionContext): builders.Doc => {
    return [
      this.visitTerminal(ctx.LPAREN()),
      this.visitExpression(ctx.expression()),
      this.visitTerminal(ctx.RPAREN()),
    ];
  };

  visitRBrace = (ctx: RBraceContext): builders.Doc => {
    if (this.indentationLevel == 0) {
      throw new Error("Indentation level less than 0");
    }
    this.indentationLevel -= this.indentationLevelChange;
    return this.addHardLine(this.visitTerminal(ctx.RBRACE()));
  };
  transformLineComment(t: Token[]) {
    return t.map((v) => {
      let s: Doc = v.text;
      if (s.indexOf("\n") !== -1) {
        s = Array<Doc>((s.match(/\n/g) || []).length).fill(this.getHardLine());
      }
      return s;
    });
  }

  visitTerminal(node: TerminalNode): builders.Doc {
    if (node.symbol.type == JackParser.LBRACE) {
      this.indentationLevel += this.indentationLevelChange;
    }
    if (this.onStartOfTheFile) {
      let a: Doc[] = [];
      const leadingComment = this.tokenStream.getHiddenTokensToLeft(
        node.symbol.tokenIndex
      );
      if (leadingComment != null) {
        if (
          leadingComment.find((v) => v.type == JackParser.BLOCK_COMMENT) !=
          undefined
        ) {
          a = leadingComment.map((v) => v.text);
        } else if (
          leadingComment != null &&
          leadingComment.find((v) => v.type == JackParser.LINE_COMMENT) !=
            undefined
        ) {
          a = this.transformLineComment(leadingComment);
        }
      }
      this.onStartOfTheFile = false;
      return [a, node.symbol.text];
    }

    const res: Doc[] = [node.symbol.text];
    const trailingComment = this.tokenStream.getHiddenTokensToRight(
      node.symbol.tokenIndex
    );

    if (trailingComment != null) {
      if (
        trailingComment[trailingComment.length - 1].type ==
        JackParser.WHITESPACE
      ) {
        const last = trailingComment[trailingComment.length - 1];
        if ((last.text.match(/\n/g) || []).length > 1) {
          const c = last.text.lastIndexOf("\n");
          last.text = last.text.substring(0, c);
          trailingComment[trailingComment.length - 1] = last;
        } else {
          trailingComment.pop();
        }
      }
      if (
        trailingComment.find((v) => v.type == JackParser.BLOCK_COMMENT) &&
        trailingComment.find((v) => v.type == JackParser.LINE_COMMENT)
      ) {
        res.push(trailingComment.map((v) => v.text));
      } else if (
        trailingComment.find((v) => v.type == JackParser.BLOCK_COMMENT) !=
        undefined
      ) {
        const commentIndex = trailingComment.findIndex(
          (v) => v.type == JackParser.BLOCK_COMMENT
        );
        //indent newlines before comment
        const b = trailingComment.map((v, i) => {
          let res: Doc = v.text;
          if (
            i < commentIndex &&
            v.type == JackParser.WHITESPACE &&
            res.indexOf("\n") !== -1
          ) {
            res = Array<Doc>((res.match(/\n/g) || []).length).fill(
              this.getHardLine()
            );
          }
          return res;
        });

        res.push(b);
      } else if (
        trailingComment.find((v) => v.type == JackParser.LINE_COMMENT) !=
        undefined
      ) {
        if (node.symbol.type == JackParser.SEMICOLON) {
          res.push(" ");
        }
        const b = this.transformLineComment(trailingComment);
        res.push(b);
      } else {
        res.push(trailingComment.map((v) => v.text));
      }
    }
    return res;
  }
  addHardLine(d: Doc) {
    return [this.getHardLine(), d];
  }
  getHardLine() {
    let ind: Doc = hardline;
    for (let i = 0; i < this.indentationLevel; i++) {
      ind = indent(ind);
    }
    return ind;
  }
}

function joinWithCommas(docs: Doc[]) {
  return join(", ", docs);
}
