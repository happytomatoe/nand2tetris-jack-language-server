// Generated from /home/babkamen/git/nand2tetris/tools/jack-lsp/jack-compiler/grammar/JackParser.g4 by ANTLR 4.13.1

	import { SubroutineScope, LocalSymbolTable } from "../symbol";

import org.antlr.v4.runtime.tree.ParseTreeListener;

/**
 * This interface defines a complete listener for a parse tree produced by
 * {@link JackParser}.
 */
public interface JackParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by {@link JackParser#program}.
	 * @param ctx the parse tree
	 */
	void enterProgram(JackParser.ProgramContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#program}.
	 * @param ctx the parse tree
	 */
	void exitProgram(JackParser.ProgramContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#classDeclaration}.
	 * @param ctx the parse tree
	 */
	void enterClassDeclaration(JackParser.ClassDeclarationContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#classDeclaration}.
	 * @param ctx the parse tree
	 */
	void exitClassDeclaration(JackParser.ClassDeclarationContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#className}.
	 * @param ctx the parse tree
	 */
	void enterClassName(JackParser.ClassNameContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#className}.
	 * @param ctx the parse tree
	 */
	void exitClassName(JackParser.ClassNameContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#classVarDec}.
	 * @param ctx the parse tree
	 */
	void enterClassVarDec(JackParser.ClassVarDecContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#classVarDec}.
	 * @param ctx the parse tree
	 */
	void exitClassVarDec(JackParser.ClassVarDecContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#fieldList}.
	 * @param ctx the parse tree
	 */
	void enterFieldList(JackParser.FieldListContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#fieldList}.
	 * @param ctx the parse tree
	 */
	void exitFieldList(JackParser.FieldListContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#fieldName}.
	 * @param ctx the parse tree
	 */
	void enterFieldName(JackParser.FieldNameContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#fieldName}.
	 * @param ctx the parse tree
	 */
	void exitFieldName(JackParser.FieldNameContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#subroutineDeclaration}.
	 * @param ctx the parse tree
	 */
	void enterSubroutineDeclaration(JackParser.SubroutineDeclarationContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#subroutineDeclaration}.
	 * @param ctx the parse tree
	 */
	void exitSubroutineDeclaration(JackParser.SubroutineDeclarationContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#subroutineType}.
	 * @param ctx the parse tree
	 */
	void enterSubroutineType(JackParser.SubroutineTypeContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#subroutineType}.
	 * @param ctx the parse tree
	 */
	void exitSubroutineType(JackParser.SubroutineTypeContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#subroutineDecWithoutType}.
	 * @param ctx the parse tree
	 */
	void enterSubroutineDecWithoutType(JackParser.SubroutineDecWithoutTypeContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#subroutineDecWithoutType}.
	 * @param ctx the parse tree
	 */
	void exitSubroutineDecWithoutType(JackParser.SubroutineDecWithoutTypeContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#subroutineName}.
	 * @param ctx the parse tree
	 */
	void enterSubroutineName(JackParser.SubroutineNameContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#subroutineName}.
	 * @param ctx the parse tree
	 */
	void exitSubroutineName(JackParser.SubroutineNameContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#subroutineReturnType}.
	 * @param ctx the parse tree
	 */
	void enterSubroutineReturnType(JackParser.SubroutineReturnTypeContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#subroutineReturnType}.
	 * @param ctx the parse tree
	 */
	void exitSubroutineReturnType(JackParser.SubroutineReturnTypeContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#varType}.
	 * @param ctx the parse tree
	 */
	void enterVarType(JackParser.VarTypeContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#varType}.
	 * @param ctx the parse tree
	 */
	void exitVarType(JackParser.VarTypeContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#parameterList}.
	 * @param ctx the parse tree
	 */
	void enterParameterList(JackParser.ParameterListContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#parameterList}.
	 * @param ctx the parse tree
	 */
	void exitParameterList(JackParser.ParameterListContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#parameter}.
	 * @param ctx the parse tree
	 */
	void enterParameter(JackParser.ParameterContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#parameter}.
	 * @param ctx the parse tree
	 */
	void exitParameter(JackParser.ParameterContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#parameterName}.
	 * @param ctx the parse tree
	 */
	void enterParameterName(JackParser.ParameterNameContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#parameterName}.
	 * @param ctx the parse tree
	 */
	void exitParameterName(JackParser.ParameterNameContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#subroutineBody}.
	 * @param ctx the parse tree
	 */
	void enterSubroutineBody(JackParser.SubroutineBodyContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#subroutineBody}.
	 * @param ctx the parse tree
	 */
	void exitSubroutineBody(JackParser.SubroutineBodyContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#rBrace}.
	 * @param ctx the parse tree
	 */
	void enterRBrace(JackParser.RBraceContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#rBrace}.
	 * @param ctx the parse tree
	 */
	void exitRBrace(JackParser.RBraceContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#varDeclaration}.
	 * @param ctx the parse tree
	 */
	void enterVarDeclaration(JackParser.VarDeclarationContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#varDeclaration}.
	 * @param ctx the parse tree
	 */
	void exitVarDeclaration(JackParser.VarDeclarationContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#varNameInDeclaration}.
	 * @param ctx the parse tree
	 */
	void enterVarNameInDeclaration(JackParser.VarNameInDeclarationContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#varNameInDeclaration}.
	 * @param ctx the parse tree
	 */
	void exitVarNameInDeclaration(JackParser.VarNameInDeclarationContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#varName}.
	 * @param ctx the parse tree
	 */
	void enterVarName(JackParser.VarNameContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#varName}.
	 * @param ctx the parse tree
	 */
	void exitVarName(JackParser.VarNameContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#statements}.
	 * @param ctx the parse tree
	 */
	void enterStatements(JackParser.StatementsContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#statements}.
	 * @param ctx the parse tree
	 */
	void exitStatements(JackParser.StatementsContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#statement}.
	 * @param ctx the parse tree
	 */
	void enterStatement(JackParser.StatementContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#statement}.
	 * @param ctx the parse tree
	 */
	void exitStatement(JackParser.StatementContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#letStatement}.
	 * @param ctx the parse tree
	 */
	void enterLetStatement(JackParser.LetStatementContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#letStatement}.
	 * @param ctx the parse tree
	 */
	void exitLetStatement(JackParser.LetStatementContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#equals}.
	 * @param ctx the parse tree
	 */
	void enterEquals(JackParser.EqualsContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#equals}.
	 * @param ctx the parse tree
	 */
	void exitEquals(JackParser.EqualsContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#ifElseStatement}.
	 * @param ctx the parse tree
	 */
	void enterIfElseStatement(JackParser.IfElseStatementContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#ifElseStatement}.
	 * @param ctx the parse tree
	 */
	void exitIfElseStatement(JackParser.IfElseStatementContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#ifStatement}.
	 * @param ctx the parse tree
	 */
	void enterIfStatement(JackParser.IfStatementContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#ifStatement}.
	 * @param ctx the parse tree
	 */
	void exitIfStatement(JackParser.IfStatementContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#ifExpression}.
	 * @param ctx the parse tree
	 */
	void enterIfExpression(JackParser.IfExpressionContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#ifExpression}.
	 * @param ctx the parse tree
	 */
	void exitIfExpression(JackParser.IfExpressionContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#elseStatement}.
	 * @param ctx the parse tree
	 */
	void enterElseStatement(JackParser.ElseStatementContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#elseStatement}.
	 * @param ctx the parse tree
	 */
	void exitElseStatement(JackParser.ElseStatementContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#whileStatement}.
	 * @param ctx the parse tree
	 */
	void enterWhileStatement(JackParser.WhileStatementContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#whileStatement}.
	 * @param ctx the parse tree
	 */
	void exitWhileStatement(JackParser.WhileStatementContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#whileExpression}.
	 * @param ctx the parse tree
	 */
	void enterWhileExpression(JackParser.WhileExpressionContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#whileExpression}.
	 * @param ctx the parse tree
	 */
	void exitWhileExpression(JackParser.WhileExpressionContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#doStatement}.
	 * @param ctx the parse tree
	 */
	void enterDoStatement(JackParser.DoStatementContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#doStatement}.
	 * @param ctx the parse tree
	 */
	void exitDoStatement(JackParser.DoStatementContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#subroutineCall}.
	 * @param ctx the parse tree
	 */
	void enterSubroutineCall(JackParser.SubroutineCallContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#subroutineCall}.
	 * @param ctx the parse tree
	 */
	void exitSubroutineCall(JackParser.SubroutineCallContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#subroutineId}.
	 * @param ctx the parse tree
	 */
	void enterSubroutineId(JackParser.SubroutineIdContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#subroutineId}.
	 * @param ctx the parse tree
	 */
	void exitSubroutineId(JackParser.SubroutineIdContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#returnStatement}.
	 * @param ctx the parse tree
	 */
	void enterReturnStatement(JackParser.ReturnStatementContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#returnStatement}.
	 * @param ctx the parse tree
	 */
	void exitReturnStatement(JackParser.ReturnStatementContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#expressionList}.
	 * @param ctx the parse tree
	 */
	void enterExpressionList(JackParser.ExpressionListContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#expressionList}.
	 * @param ctx the parse tree
	 */
	void exitExpressionList(JackParser.ExpressionListContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#expression}.
	 * @param ctx the parse tree
	 */
	void enterExpression(JackParser.ExpressionContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#expression}.
	 * @param ctx the parse tree
	 */
	void exitExpression(JackParser.ExpressionContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#groupedExpression}.
	 * @param ctx the parse tree
	 */
	void enterGroupedExpression(JackParser.GroupedExpressionContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#groupedExpression}.
	 * @param ctx the parse tree
	 */
	void exitGroupedExpression(JackParser.GroupedExpressionContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#unaryOperation}.
	 * @param ctx the parse tree
	 */
	void enterUnaryOperation(JackParser.UnaryOperationContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#unaryOperation}.
	 * @param ctx the parse tree
	 */
	void exitUnaryOperation(JackParser.UnaryOperationContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#arrayAccess}.
	 * @param ctx the parse tree
	 */
	void enterArrayAccess(JackParser.ArrayAccessContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#arrayAccess}.
	 * @param ctx the parse tree
	 */
	void exitArrayAccess(JackParser.ArrayAccessContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#constant}.
	 * @param ctx the parse tree
	 */
	void enterConstant(JackParser.ConstantContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#constant}.
	 * @param ctx the parse tree
	 */
	void exitConstant(JackParser.ConstantContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#booleanLiteral}.
	 * @param ctx the parse tree
	 */
	void enterBooleanLiteral(JackParser.BooleanLiteralContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#booleanLiteral}.
	 * @param ctx the parse tree
	 */
	void exitBooleanLiteral(JackParser.BooleanLiteralContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#unaryOperator}.
	 * @param ctx the parse tree
	 */
	void enterUnaryOperator(JackParser.UnaryOperatorContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#unaryOperator}.
	 * @param ctx the parse tree
	 */
	void exitUnaryOperator(JackParser.UnaryOperatorContext ctx);
	/**
	 * Enter a parse tree produced by {@link JackParser#binaryOperator}.
	 * @param ctx the parse tree
	 */
	void enterBinaryOperator(JackParser.BinaryOperatorContext ctx);
	/**
	 * Exit a parse tree produced by {@link JackParser#binaryOperator}.
	 * @param ctx the parse tree
	 */
	void exitBinaryOperator(JackParser.BinaryOperatorContext ctx);
}