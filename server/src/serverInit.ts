import {
  CompletionItem,
  Connection,
  DidChangeConfigurationNotification,
  DidOpenTextDocumentParams,
  DocumentDiagnosticReportKind,
  InitializeParams,
  InitializeResult,
  TextDocuments,
  TextDocumentSyncKind,
  type DocumentDiagnosticReport,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import { LanguageService } from "./language.service";

export class JackServer {
  private languageService: LanguageService;

  constructor(
    private readonly connection: Connection,
    private documents: TextDocuments<TextDocument> = new TextDocuments(
      TextDocument
    )
  ) {
    this.languageService = new LanguageService(documents);
    let hasConfigurationCapability = false;
    let hasWorkspaceFolderCapability = false;
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

      const result: InitializeResult = {
        capabilities: {
          textDocumentSync: TextDocumentSyncKind.Incremental,
          diagnosticProvider: {
            interFileDependencies: false,
            workspaceDiagnostics: false,
          },
          documentFormattingProvider: true,
          completionProvider: {
            resolveProvider: true,
            triggerCharacters: ["."],
          },
          definitionProvider: true,
        },
      };
      if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
          workspaceFolders: {
            supported: true,
          },
        };
      }
      return result;
    });

    connection.onInitialized(() => {
      if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(
          DidChangeConfigurationNotification.type,
          undefined
        );
      }
      if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(() => {
          connection.console.log("Workspace folder change event received.");
        });
      }
    });

    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.connection.onCompletion(
      this.languageService.provideCodeCompletions.bind(this.languageService)
    );
    // This handler resolves additional information for the item selected in
    // the completion list.
    this.connection.onCompletionResolve(
      (item: CompletionItem): CompletionItem => {
        return item;
      }
    );
    this.documents.onDidChangeContent((change) => this.languageService.validateTextDocument(change.document));

    this.connection.onDidOpenTextDocument(
      (params: DidOpenTextDocumentParams) => {
        const document = this.documents.get(params.textDocument.uri);
        this.languageService.validateTextDocument(document);
      }
    );
    this.connection.onDefinition(
      this.languageService.findDefinition.bind(this.languageService)
    );
    this.connection.onDocumentFormatting(
      this.languageService.formatDocument.bind(this.languageService)
    );
    this.connection.languages.diagnostics.on(async (params) => {
      const document = this.documents.get(params.textDocument.uri);
      if (document !== undefined) {
        return {
          kind: DocumentDiagnosticReportKind.Full,
          items: await this.languageService.validateTextDocument(document),
        } satisfies DocumentDiagnosticReport;
      } else {
        // We don't know the document. We can either try to read it from disk
        // or we don't report problems for it.
        return {
          kind: DocumentDiagnosticReportKind.Full,
          items: [],
        } satisfies DocumentDiagnosticReport;
      }
    });
  }

  start(): void {
    this.documents.listen(this.connection);
    this.connection.listen();
  }
}
