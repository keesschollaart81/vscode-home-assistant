import { createConnection, TextDocuments, ProposedFeatures, ServerCapabilities, Diagnostic } from "vscode-languageserver";
import { JSONSchemaService } from "yaml-language-server/out/server/src/languageservice/services/jsonSchemaService";
import * as path from "path";
import * as hals from "home-assistant-language-service";
import { HaConnection } from "home-assistant-language-service/dist/home-assistant/haConnection";
import { ConfigurationService } from "home-assistant-language-service/dist/configuration";
import { HomeAssistantConfiguration } from "home-assistant-language-service/dist/haConfig/haConfig";
import { JsonLanguageService } from "home-assistant-language-service/dist/jsonLanguageService";
import { YamlLanguageService } from "home-assistant-language-service/dist/yamlLanguageService";
import { SchemaServiceForIncludes } from "home-assistant-language-service/dist/schemas/schemaService";
import { IncludeDefinitionProvider } from "home-assistant-language-service/dist/definition/includes";
import { ScriptDefinitionProvider } from "home-assistant-language-service/dist/definition/scripts";
import { EntityIdCompletionContribution } from "home-assistant-language-service/dist/completionHelpers/entityIds";
import { ServicesCompletionContribution } from "home-assistant-language-service/dist/completionHelpers/services";
import { VsCodeFileAccessor } from "./fileAccessor";

let connection = createConnection(ProposedFeatures.all);

console.log = connection.console.log.bind(connection.console);
// console.error = connection.console.error.bind(connection.console);
console.warn = connection.window.showWarningMessage.bind(connection.window);
console.error = connection.window.showErrorMessage.bind(connection.window);

let documents = new TextDocuments();
documents.listen(connection);

connection.onInitialize(async params => {

  connection.console.log(`[Home Assistant Language Server(${process.pid})] Started and initialize received`);

  var configurationService = new ConfigurationService();
  var haConnection = new HaConnection(configurationService);
  var fileAccessor = new VsCodeFileAccessor(params.rootUri, documents);
  var haConfig = new HomeAssistantConfiguration(fileAccessor);

  var definitionProviders = [
    new IncludeDefinitionProvider(fileAccessor),
    new ScriptDefinitionProvider(haConfig)
  ];

  let jsonSchemaService = new JSONSchemaService(null, {
    resolveRelativePath: (relativePath: string, resource: string) => {
      return path.resolve(resource, relativePath);
    }
  }, Promise);

  var jsonWorkerContributions = [
    new EntityIdCompletionContribution(haConnection),
    new ServicesCompletionContribution(haConnection)
  ];

  var jsonLanguageService = new JsonLanguageService(jsonSchemaService, jsonWorkerContributions);

  var yamlLanguageServiceWrapper = new YamlLanguageService(
    jsonSchemaService,
    jsonLanguageService,
    jsonWorkerContributions);

  let schemaServiceForIncludes = new SchemaServiceForIncludes(jsonSchemaService);

  var sendDiagnostics = async (uri: string, diagnostics: Diagnostic[]) => {
    connection.sendDiagnostics({
      uri: uri,
      diagnostics: diagnostics
    });
  };

  let discoverFilesAndUpdateSchemas = async () => {
    try {
      await haConfig.discoverFiles();
      await homeAsisstantLanguageService.findAndApplySchemas();
    }
    catch (e) {
      console.error(`Unexpected error during file discovery / schema configuration: ${e}`);
    }
  };

  var homeAsisstantLanguageService = new hals.HomeAssistantLanguageService(
    yamlLanguageServiceWrapper,
    haConfig,
    haConnection,
    definitionProviders,
    schemaServiceForIncludes,
    sendDiagnostics,
    async () => {
      documents.all().forEach(async d => {
        var diagnostics = await homeAsisstantLanguageService.getDiagnostics(d);
        sendDiagnostics(d.uri, diagnostics);
      });
    }
  );

  documents.onDidChangeContent((e) => homeAsisstantLanguageService.onDocumentChange(e));
  documents.onDidOpen((e) => homeAsisstantLanguageService.onDocumentOpen(e));

  let onDidSaveDebounce: NodeJS.Timer;
  documents.onDidSave((e) => {
    clearTimeout(onDidSaveDebounce);
    onDidSaveDebounce = setTimeout(discoverFilesAndUpdateSchemas, 100);
  });

  connection.onDocumentSymbol((p) => homeAsisstantLanguageService.onDocumentSymbol(documents.get(p.textDocument.uri)));
  connection.onDocumentFormatting((p) => homeAsisstantLanguageService.onDocumentFormatting(documents.get(p.textDocument.uri), p.options));
  connection.onCompletion((p) => homeAsisstantLanguageService.onCompletion(documents.get(p.textDocument.uri), p.position));
  connection.onCompletionResolve((p) => homeAsisstantLanguageService.onCompletionResolve(p));
  connection.onHover((p) => homeAsisstantLanguageService.onHover(documents.get(p.textDocument.uri), p.position));
  connection.onDefinition((p) => homeAsisstantLanguageService.onDefinition(documents.get(p.textDocument.uri), p.position));

  connection.onDidChangeConfiguration(async (config) => {
    configurationService.updateConfiguration(config);
    await haConnection.notifyConfigUpdate();

    if (!configurationService.isConfigured) {
      connection.sendNotification("no-config");
    }
  });

  //fire and forget
  setTimeout(discoverFilesAndUpdateSchemas, 0);

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
