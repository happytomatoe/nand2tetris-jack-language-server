import * as vscode from "vscode";
import * as assert from "assert";
import { getDocUri, activate } from "./helper";

suite("Should get diagnostics", () => {
  test("lexer error", async () => {
    const docUri = getDocUri("LexerError.jack");
    await testDiagnostics(docUri, [
      {
        message: "token recognition error at: '%'",
        range: toRange(1, 1, 1, 2),
        severity: vscode.DiagnosticSeverity.Error,
      },
    ]);
  });
  test("parser error", async () => {
    const docUri = getDocUri("ParserError.jack");
    await testDiagnostics(docUri, [
      {
        message:
          "extraneous input 'field' expecting {'int', 'char', 'boolean', IDENTIFIER}",
        range: toRange(1, 7, 1, 12),
        severity: vscode.DiagnosticSeverity.Error,
      },
    ]);
  });
  test("validation error", async () => {
    const docUri = getDocUri("ClassNotFound.jack");
    await testDiagnostics(docUri, [
      {
        message: "Class B doesn't exist",
        range: toRange(1, 7, 1, 8),
        severity: vscode.DiagnosticSeverity.Error,
      },
    ]);
  });
  test("valid", async () => {
    const docUri = getDocUri("dino/Main.jack");
    await activate(docUri);
    const actualDiagnostics = vscode.languages.getDiagnostics(docUri);
    assert.equal(actualDiagnostics.length, 0);
  });
  //TODO: add smoke tests for other language server function - like go to definition and code completion
});

function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
  const start = new vscode.Position(sLine, sChar);
  const end = new vscode.Position(eLine, eChar);
  return new vscode.Range(start, end);
}

async function testDiagnostics(
  docUri: vscode.Uri,
  expectedDiagnostics: vscode.Diagnostic[]
) {
  await activate(docUri);

  const actualDiagnostics = vscode.languages.getDiagnostics(docUri);
  try {
    assert.equal(actualDiagnostics.length, expectedDiagnostics.length);
  } catch (e) {
    console.error("Diagnostics:", actualDiagnostics);
    throw e;
  }

  expectedDiagnostics.forEach((expectedDiagnostic, i) => {
    const actualDiagnostic = actualDiagnostics[i];
    assert.equal(actualDiagnostic.message, expectedDiagnostic.message);
    assert.deepEqual(actualDiagnostic.range, expectedDiagnostic.range);
    assert.equal(actualDiagnostic.severity, expectedDiagnostic.severity);
  });
}
