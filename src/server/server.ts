import { createConnection, TextDocuments, ProposedFeatures, ServerCapabilities, TextDocumentChangeEvent, DidChangeConfigurationNotification, Files, DidChangeConfigurationParams } from "vscode-languageserver";
import { VsCodeFileAccessor } from "./fileAccessor";
import { HomeAssistantLanguageService } from "./haLanguageService";
import { HaConnection } from "./home-assistant/haConnection";
import { YamlLanguageServiceWrapper } from "./yamlLanguageServiceWrapper";
import { EntityIdCompletionContribution } from "./completionHelpers/entityIds";
import { ConfigurationService } from "./configuration";
import { ServicesCompletionContribution } from "./completionHelpers/services";
import { YamlIncludeDiscovery } from "./yamlIncludes/discovery";
import { DefinitionProvider } from "./definition";

let connection = createConnection(ProposedFeatures.all);

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

let documents = new TextDocuments();
documents.listen(connection);

connection.onInitialize(async params => {

  connection.console.log(`[Server(${process.pid})] Started and initialize received`);

  var configurationService = new ConfigurationService();
  var haConnection = new HaConnection(configurationService);
  var vsCodeFileAccessor = new VsCodeFileAccessor(params.rootUri, connection);
  var yamlLanguageServiceWrapper = new YamlLanguageServiceWrapper([
    new EntityIdCompletionContribution(haConnection),
    new ServicesCompletionContribution(haConnection)
  ]);
  var yamlIncludeDiscoveryService = new YamlIncludeDiscovery(vsCodeFileAccessor);
  var definitionProvider = new DefinitionProvider(vsCodeFileAccessor);
  var homeAsisstantLanguageService = new HomeAssistantLanguageService(
    documents,
    params.rootUri,
    yamlLanguageServiceWrapper,
    yamlIncludeDiscoveryService,
    haConnection,
    definitionProvider
  );
  await homeAsisstantLanguageService.triggerSchemaLoad();

  var triggerValidation = async (e: TextDocumentChangeEvent) => {
    var diagnostics = await homeAsisstantLanguageService.getDiagnostics(e);
    if (diagnostics) {
      connection.sendDiagnostics({
        uri: e.document.uri,
        diagnostics: diagnostics
      });
    }
  };

  documents.onDidChangeContent(triggerValidation);
  documents.onDidOpen(triggerValidation);

  // connection.client.register(DidChangeConfigurationNotification.type, undefined);
  connection.onDidChangeConfiguration(async (config) => {
    configurationService.updateConfiguration(config);
    await haConnection.notifyConfigUpdate();
  });

  connection.onDocumentSymbol(homeAsisstantLanguageService.onDocumentSymbol);
  connection.onDocumentFormatting(homeAsisstantLanguageService.onDocumentFormatting);
  connection.onCompletion(homeAsisstantLanguageService.onCompletion);
  connection.onCompletionResolve(homeAsisstantLanguageService.onCompletionResolve);
  connection.onHover(homeAsisstantLanguageService.onHover);
  connection.onDefinition((td) => homeAsisstantLanguageService.onDefinition(td, documents.get(td.textDocument.uri)))
  connection.onDidChangeWatchedFiles(homeAsisstantLanguageService.onDidChangeWatchedFiles);

  return {
    capabilities: <ServerCapabilities>{
      textDocumentSync: documents.syncKind,
      completionProvider: { triggerCharacters: [" "], resolveProvider: true },
      hoverProvider: true,
      documentSymbolProvider: true,
      documentFormattingProvider: true,
      definitionProvider: true
    }
  };
});

connection.listen();
