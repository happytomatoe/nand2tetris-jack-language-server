import { TerminalNode } from "antlr4";
import JackParser, { ArrayAccessContext, ClassDeclarationContext, ClassVarDecContext, ConstantContext, DoStatementContext, ElseStatementContext, ExpressionContext, ExpressionListContext, GroupedExpressionContext, IfElseStatementContext, IfExpressionContext, IfStatementContext, LetStatementContext, ParameterContext, ParameterListContext, ProgramContext, RBraceContext, ReturnStatementContext, StatementContext, StatementsContext, SubroutineBodyContext, SubroutineCallContext, SubroutineDeclarationContext, SubroutineIdContext, UnaryOperationContext, VarDeclarationContext, VarNameContext, WhileExpressionContext, WhileStatementContext } from 'jack-compiler/out/generated/JackParser';
import JackParserVisitor from 'jack-compiler/out/generated/JackParserVisitor';
import { Doc, doc } from 'prettier';
import { builders } from 'prettier/doc';
const { join, line, hardline, softline, ifBreak, indent, group } = doc.builders;
export class JackVisitor extends JackParserVisitor<Doc> {
	private indentationLevel = 0;
	private indentationLevelChange = 1;
	visitProgram = (ctx: ProgramContext): builders.Doc => {
		return this.visitClassDeclaration(ctx.classDeclaration());
	}

	//	CLASS className LBRACE classVarDec* subroutineDeclaration* rBrace;
	visitClassDeclaration = (ctx: ClassDeclarationContext): builders.Doc => {
		return [
			group(
				[
					this.visitTerminal(ctx.CLASS()),
					" ",
					ctx.className().getText(),
					" ",
					this.visitTerminal(ctx.LBRACE()),
				],
			),
			this.indent(),
			[
				ctx.classVarDec_list().map(v => this.addHardLine(this.visitClassVarDec(v))),
				ctx.subroutineDeclaration_list().map(v => this.addHardLine(this.visitSubroutineDeclaration(v))),
				this.visitRBrace(ctx.rBrace())
			]
		];
	}
	// classVarDec: (STATIC | FIELD) fieldList SEMICOLON;
	visitClassVarDec = (ctx: ClassVarDecContext): builders.Doc => {
		throw new Error("Not implemented");
	}


	// subroutineDeclaration: subroutineType subroutineDecWithoutType;
	// subroutineType: CONSTRUCTOR | METHOD | FUNCTION;
	// subroutineDecWithoutType:
	// 	subroutineReturnType subroutineName LPAREN parameterList RPAREN subroutineBody;
	visitSubroutineDeclaration = (ctx: SubroutineDeclarationContext): builders.Doc => {
		const subroutineDecWithoutType = ctx.subroutineDecWithoutType();


		const bodyContext: SubroutineBodyContext = subroutineDecWithoutType.subroutineBody();
		return [
			group([
				ctx.subroutineType().getText(), " ",
				subroutineDecWithoutType.subroutineReturnType().getText(), " ",
				subroutineDecWithoutType.subroutineName().getText(),
				this.visitTerminal(subroutineDecWithoutType.LPAREN()),
				this.visitParameterList(subroutineDecWithoutType.parameterList()),
				this.visitTerminal(subroutineDecWithoutType.RPAREN()),
				" ",
				this.visitTerminal(bodyContext.LBRACE()),
			]),
			this.indent(),
			// subroutineBody: LBRACE varDeclaration* statements rBrace;
			bodyContext.varDeclaration_list().map(v => this.addHardLine(this.visitVarDeclaration(v))),
			this.visitStatements(bodyContext.statements()),
			this.visitRBrace(bodyContext.rBrace())
		];
	}

	// VAR varType varNameInDeclaration (COMMA varNameInDeclaration)* SEMICOLON;
	visitVarDeclaration = (ctx: VarDeclarationContext): builders.Doc => {
		const t = group([
			this.visitTerminal(ctx.VAR()),
			" ",
			ctx.varType().getText(),
			" ",
			joinList(ctx.varNameInDeclaration_list().map(v => this.visitVarName(v))),
			this.visitTerminal(ctx.SEMICOLON())
		])
		return t;
	}
	visitVarName = (ctx: VarNameContext): builders.Doc => {
		return this.visitTerminal(ctx.IDENTIFIER());
	}
	visitStatements = (ctx: StatementsContext): builders.Doc[] => {
		return ctx.statement_list().map(v => this.addHardLine(this.visitStatement(v)))
	}
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
			throw new Error("Not implemented");
		}
	}
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
			this.visitTerminal(ctx.LET()), " ",
			leftSide, this.visitTerminal(ctx.equals().EQUALS()), this.visitExpression(ctx.expression()),
			this.visitTerminal(ctx.SEMICOLON())
		]);
	}
	// ifElseStatement: ifStatement elseStatement?;
	visitIfElseStatement = (ctx: IfElseStatementContext): builders.Doc => {
		this.indent();
		return [
			this.visitIfStatement(ctx.ifStatement()),
			ctx.elseStatement() != null ? this.visitElseStatement(ctx.elseStatement()) : ""
		];
	}
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
			this.visitRBrace(ctx.rBrace())
		];
	}
	// ifExpression: expression;
	visitIfExpression = (ctx: IfExpressionContext): builders.Doc => {
		return this.visitExpression(ctx.expression());
	}
	//elseStatement: ELSE LBRACE statements rBrace;
	visitElseStatement = (ctx: ElseStatementContext): builders.Doc => {
		return [
			this.visitTerminal(ctx.ELSE()),
			this.visitTerminal(ctx.LBRACE()),
			this.visitStatements(ctx.statements()),
			this.visitRBrace(ctx.rBrace())
		];
	}

	// 	WHILE LPAREN whileExpression RPAREN LBRACE statements rBrace;
	visitWhileStatement = (ctx: WhileStatementContext): builders.Doc => {
		this.indent();
		return [
			this.visitTerminal(ctx.WHILE()),
			" ",
			this.visitTerminal(ctx.LPAREN()),
			this.visitWhileExpression(ctx.whileExpression()),
			this.visitTerminal(ctx.RPAREN()),
			" ",
			this.visitTerminal(ctx.LBRACE()),
			this.visitStatements(ctx.statements()),
			this.visitRBrace(ctx.rBrace())
		]
	}
	//whileExpression: expression;
	visitWhileExpression = (ctx: WhileExpressionContext): builders.Doc => {
		return this.visitExpression(ctx.expression());
	}
	// 	doStatement: DO subroutineCall SEMICOLON;
	visitDoStatement = (ctx: DoStatementContext): builders.Doc => {
		return [
			this.visitTerminal(ctx.DO()),
			" ",
			this.visitSubroutineCall(ctx.subroutineCall()),
			this.visitTerminal(ctx.SEMICOLON())
		];
	}
	// 	subroutineCall: subroutineId LPAREN expressionList RPAREN;
	visitSubroutineCall = (ctx: SubroutineCallContext): builders.Doc => {
		return [
			this.visitSubroutineId(ctx.subroutineId()),
			this.visitTerminal(ctx.LPAREN()),
			this.visitExpressionList(ctx.expressionList()),
			this.visitTerminal(ctx.RPAREN())
		]
	}
	// 	subroutineId: ((className | THIS_LITERAL) DOT)? subroutineName;
	visitSubroutineId = (ctx: SubroutineIdContext): builders.Doc => {
		return [
			(ctx.className() != null ? ctx.className().getText() : ""),
			this.visitTerminal(ctx.DOT()),
			ctx.subroutineName().getText()
		]
	}
	// expressionList: (expression (COMMA expression)*)?;
	visitExpressionList = (ctx: ExpressionListContext): builders.Doc => {
		return joinList(ctx.expression_list().map(v => this.visitExpression(v)));
	}

	//returnStatement: RETURN expression? SEMICOLON;
	visitReturnStatement = (ctx: ReturnStatementContext): builders.Doc => {
		return [
			this.visitTerminal(ctx.RETURN()),
			ctx.expression() != null ? [" ", this.visitExpression(ctx.expression())] : "",
			this.visitTerminal(ctx.SEMICOLON())
		];
	}
	//expression:
	// constant
	// | varName
	// | subroutineCall
	// | arrayAccess
	// | unaryOperation
	// | expression binaryOperator expression
	// | groupedExpression;
	visitExpression = (ctx: ExpressionContext): builders.Doc => {
		if (ctx.constant() != null) {
			return this.visitConstant(ctx.constant());
		} else if (ctx.varName() != null) {
			return ctx.varName().getText();
		} else if (ctx.subroutineCall() != null) {
			return this.visitSubroutineCall(ctx.subroutineCall());
		} else if (ctx.arrayAccess() != null) {
			return this.visitArrayAccess(ctx.arrayAccess());
		} else if (ctx.unaryOperation() != null) {
			return this.visitUnaryOperation(ctx.unaryOperation());
		} else if (ctx.binaryOperator() != null) {
			const op1 = this.visitExpression(ctx.expression(0));
			const binaryOp = ctx.binaryOperator().getText();
			const t = ctx.expression(1);
			const op2 = this.visitExpression(t);
			return join(" ", [op1, binaryOp, op2]);
		} else if (ctx.groupedExpression() != null) {
			return this.visitGroupedExpression(ctx.groupedExpression());
		}
		throw new Error("Unknown expression " + ctx.getText());
	}
	//constant:
	// INTEGER_LITERAL
	// | STRING_LITERAL
	// | booleanLiteral
	// | NULL_LITERAL
	// | THIS_LITERAL;
	visitConstant = (ctx: ConstantContext): builders.Doc => {
		return ctx.getText();
	}
	visitUnaryOperation = (ctx: UnaryOperationContext): builders.Doc => {
		return [ctx.unaryOperator().getText(), " ", this.visitExpression(ctx.expression())];
	}
	// arrayAccess: varName LBRACKET expression RBRACKET;
	visitArrayAccess = (ctx: ArrayAccessContext): builders.Doc => {
		return [
			ctx.varName().getText(),
			this.visitTerminal(ctx.LBRACKET()),
			this.visitExpression(ctx.expression()),
			this.visitTerminal(ctx.RBRACKET())
		];
	}
	visitGroupedExpression = (ctx: GroupedExpressionContext): builders.Doc => {
		return [this.visitTerminal(ctx.LPAREN()), this.visitExpression(ctx.expression()), this.visitTerminal(ctx.RPAREN())];
	}
	visitParameterList = (ctx: ParameterListContext): builders.Doc => {
		return joinList(ctx.parameter_list().map(v => this.visitParameter(v)));
	}
	//varType parameterName
	visitParameter = (ctx: ParameterContext): builders.Doc => {
		return join(" ", [ctx.varType().getText(), ctx.parameterName().getText()]);
	}

	visitRBrace = (ctx: RBraceContext): builders.Doc => {
		this.indentationLevel -= this.indentationLevelChange;;
		return this.addHardLine(this.visitTerminal(ctx.RBRACE()));
	}
	visitTerminal(node: TerminalNode): builders.Doc {
		switch (node.symbol.type) {
			case JackParser.EQUALS:
				return [" ", node.symbol.text, " "];
			default:
				return node.symbol.text;

		}

	}
	addHardLine(d: Doc) {
		return [this.getHardLine(), d]
	}
	getHardLine() {
		const t = hardline;
		//TODO: change
		let ind: any = t;
		for (let i = 0; i < this.indentationLevel; i++) {
			ind = indent(ind);
		}
		return ind;
	}
	indent(): builders.Doc {
		this.indentationLevel += this.indentationLevelChange;;
		return "";
	}

}

function joinList(docs: Doc[]) {
	return join(", ", docs);
}