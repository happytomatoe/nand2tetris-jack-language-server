// Generated from JackParser.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from "antlr4ng";




import { ArrayAccessContext, BinaryOperatorContext, BooleanLiteralContext, ClassDeclarationContext, ClassNameContext, ClassVarDecContext, ConstantContext, DoStatementContext, ElseStatementContext, EqualsContext, ExpressionContext, ExpressionListContext, FieldListContext, FieldNameContext, GroupedExpressionContext, IfElseStatementContext, IfExpressionContext, IfStatementContext, LetStatementContext, ParameterContext, ParameterListContext, ParameterNameContext, ProgramContext, RBraceContext, ReturnStatementContext, StatementContext, StatementsContext, SubroutineBodyContext, SubroutineCallContext, SubroutineDeclarationContext, SubroutineDecWithoutTypeContext, SubroutineIdContext, SubroutineNameContext, SubroutineReturnTypeContext, SubroutineTypeContext, UnaryOperationContext, UnaryOperatorContext, VarDeclarationContext, VarNameContext, VarNameInDeclarationContext, VarTypeContext, WhileExpressionContext, WhileStatementContext } from "./JackParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `JackParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class JackParserVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `JackParser.program`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProgram?: (ctx: ProgramContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.classDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitClassDeclaration?: (ctx: ClassDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.className`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitClassName?: (ctx: ClassNameContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.classVarDec`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitClassVarDec?: (ctx: ClassVarDecContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.fieldList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldList?: (ctx: FieldListContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.fieldName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldName?: (ctx: FieldNameContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.subroutineDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubroutineDeclaration?: (ctx: SubroutineDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.subroutineType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubroutineType?: (ctx: SubroutineTypeContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.subroutineDecWithoutType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubroutineDecWithoutType?: (ctx: SubroutineDecWithoutTypeContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.subroutineName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubroutineName?: (ctx: SubroutineNameContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.subroutineReturnType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubroutineReturnType?: (ctx: SubroutineReturnTypeContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.varType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVarType?: (ctx: VarTypeContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.parameterList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParameterList?: (ctx: ParameterListContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.parameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParameter?: (ctx: ParameterContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.parameterName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParameterName?: (ctx: ParameterNameContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.subroutineBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubroutineBody?: (ctx: SubroutineBodyContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.rBrace`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRBrace?: (ctx: RBraceContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.varDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVarDeclaration?: (ctx: VarDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.varNameInDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVarNameInDeclaration?: (ctx: VarNameInDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.statements`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStatements?: (ctx: StatementsContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStatement?: (ctx: StatementContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.letStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetStatement?: (ctx: LetStatementContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.equals`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEquals?: (ctx: EqualsContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.ifElseStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIfElseStatement?: (ctx: IfElseStatementContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.ifStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIfStatement?: (ctx: IfStatementContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.ifExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIfExpression?: (ctx: IfExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.elseStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElseStatement?: (ctx: ElseStatementContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.whileStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhileStatement?: (ctx: WhileStatementContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.whileExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhileExpression?: (ctx: WhileExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.doStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDoStatement?: (ctx: DoStatementContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.subroutineCall`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubroutineCall?: (ctx: SubroutineCallContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.subroutineId`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubroutineId?: (ctx: SubroutineIdContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.returnStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitReturnStatement?: (ctx: ReturnStatementContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.expressionList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpressionList?: (ctx: ExpressionListContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpression?: (ctx: ExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.constant`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConstant?: (ctx: ConstantContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.varName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVarName?: (ctx: VarNameContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.arrayAccess`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArrayAccess?: (ctx: ArrayAccessContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.unaryOperation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnaryOperation?: (ctx: UnaryOperationContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.groupedExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGroupedExpression?: (ctx: GroupedExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.booleanLiteral`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBooleanLiteral?: (ctx: BooleanLiteralContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.unaryOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnaryOperator?: (ctx: UnaryOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `JackParser.binaryOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBinaryOperator?: (ctx: BinaryOperatorContext) => Result;
}

