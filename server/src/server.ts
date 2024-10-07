import {
	createConnection,
	TextDocuments,
	Diagnostic,
	// DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	DocumentDiagnosticReportKind,
	type DocumentDiagnosticReport,
	DiagnosticSeverity,
	DocumentFormattingParams,
	Position,
	Range,
	TextEdit,
} from 'vscode-languageserver/node';
import {
	TextDocument,
} from 'vscode-languageserver-textdocument';
import { Compiler, JackCompilerError } from 'jack-compiler/out/index';
import * as prettier from 'prettier';
import { JackPlugin } from 'prettier-plugin-jack/out/index';
// import { JackCompilerError } from 'jack-compiler';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
const hasFormattingCapability = true;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {

	connection.console.log("Server on init...");
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			},
			diagnosticProvider: {
				interFileDependencies: false,
				workspaceDiagnostics: false
			},
			documentFormattingProvider: true,
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {

	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {


	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.languageServerExample || defaultSettings)
		);
	}
	// Refresh the diagnostics since the `maxNumberOfProblems` could have changed.
	// We could optimize things here and re-fetch the setting first can compare it
	// to the existing setting, but this is out of scope for this example.
	connection.languages.diagnostics.refresh();
});

// function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
// 	if (!hasConfigurationCapability) {
// 		return Promise.resolve(globalSettings);
// 	}
// 	let result = documentSettings.get(resource);
// 	if (!result) {
// 		result = connection.workspace.getConfiguration({
// 			scopeUri: resource,
// 			section: 'languageServerExample'
// 		});
// 		documentSettings.set(resource, result);
// 	}
// 	return result;
// }

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});


connection.languages.diagnostics.on(async (params) => {
	const document = documents.get(params.textDocument.uri);
	if (document !== undefined) {
		return {
			kind: DocumentDiagnosticReportKind.Full,
			items: await validateTextDocument(document)
		} satisfies DocumentDiagnosticReport;
	} else {
		// We don't know the document. We can either try to read it from disk
		// or we don't report problems for it.
		return {
			kind: DocumentDiagnosticReportKind.Full,
			items: []
		} satisfies DocumentDiagnosticReport;
	}
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	connection.console.log("Server on change...");
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<Diagnostic[]> {
	console.log(textDocument);
	// In this simple example we get the settings for every validate run.
	// const settings = await getDocumentSettings(textDocument.uri);

	// The validator creates diagnostics for all uppercase words length 2 and more
	const text = textDocument.getText();

	const compiler = new Compiler();
	const parsedOrErrors = compiler.parse(text);
	if (Array.isArray(parsedOrErrors)) {
		return parsedOrErrors.map(m => toDiagnostics(textDocument, m));
	}
	const bindedOrErrors = compiler.bind(parsedOrErrors);
	if (Array.isArray(bindedOrErrors)) {
		return bindedOrErrors.map(m => toDiagnostics(textDocument, m));
	}

	const validatedOrErrors = compiler.validate(bindedOrErrors);
	if (Array.isArray(validatedOrErrors)) {
		return validatedOrErrors.map(m => toDiagnostics(textDocument, m));
	}
	return [];
}


function toDiagnostics(textDocument: TextDocument, e: JackCompilerError) {
	console.log("Error: " + JSON.stringify(e));
	return {
		severity: DiagnosticSeverity.Error,
		range: {
			start: textDocument.positionAt(e.span.start),
			end: textDocument.positionAt(e.span.end),
		},
		message: e.msg,
	};
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received a file change event');
});



connection.onDocumentFormatting(async (formatParams: DocumentFormattingParams): Promise<TextEdit[]> => {
	const document = documents.get(formatParams.textDocument.uri);

	if (!document) {
		return [];
	}

	try {
		const text = document.getText();
		const formatted = await prettier.format(text, {
			parser: "jack",
			plugins: [JackPlugin],
			tabWidth: formatParams.options.tabSize,
			singleQuote: false,
			useTabs: !formatParams.options.insertSpaces,
		});
		connection.console.log("Formatting document: " + formatted);
		return [TextEdit.replace(Range.create(Position.create(0, 0), document.positionAt(text.length)), formatted)];
	} catch (error) {
		if (typeof error == "string")
			connection.console.error("Error formatting document:" + error);
		if (error instanceof Error) {
			connection.console.error("Error formatting document:" + error.message);

		}
		return [];
	}
});
// console.log = connection.console.log;

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
