import { createConnection, TextDocuments, ProposedFeatures, ServerCapabilities, Diagnostic } from "vscode-languageserver";
import { HaConnection } from "../language-service/src/home-assistant/haConnection";
import { ConfigurationService } from "../language-service/src/configuration";
import { HomeAssistantConfiguration } from "../language-service/src/haConfig/haConfig";
import { HomeAssistantLanguageService } from "../language-service/src/haLanguageService";
import { SchemaServiceForIncludes } from "../language-service/src/schemas/schemaService";
import { IncludeDefinitionProvider } from "../language-service/src/definition/includes";
import { ScriptDefinitionProvider } from "../language-service/src/definition/scripts";
import { EntityIdCompletionContribution } from "../language-service/src/completionHelpers/entityIds";
import { ServicesCompletionContribution } from "../language-service/src/completionHelpers/services";
import { VsCodeFileAccessor } from "./fileAccessor";
import { getLanguageService } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";

let connection = createConnection(ProposedFeatures.all);

console.log = connection.console.log.bind(connection.console);
console.warn = connection.window.showWarningMessage.bind(connection.window);
console.error = connection.window.showErrorMessage.bind(connection.window);

let documents = new TextDocuments();
documents.listen(connection);

connection.onInitialize(async params => {

  connection.console.log(`[Home Assistant Language Server(${process.pid})] Started and initialize received`);

  var configurationService = new ConfigurationService();
  var haConnection = new HaConnection(configurationService);
  var fileAccessor = new VsCodeFileAccessor(params.rootUri, documents);
  var haConfig = new HomeAssistantConfiguration(fileAccessor, configurationService);

  var definitionProviders = [
    new IncludeDefinitionProvider(fileAccessor),
    new ScriptDefinitionProvider(haConfig)
  ];

  var jsonWorkerContributions = [
    new EntityIdCompletionContribution(haConnection),
    new ServicesCompletionContribution(haConnection)
  ];

  let schemaServiceForIncludes = new SchemaServiceForIncludes();

  let yamlLanguageService = getLanguageService(
    async () => "",
    null,
    jsonWorkerContributions
  );

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

  var homeAsisstantLanguageService = new HomeAssistantLanguageService(
    yamlLanguageService,
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
  documents.onDidSave(() => {
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
  
  connection.onRequest("callService", (args: { domain: string, service: string, serviceData?: any }) => {
    haConnection.callService(args.domain, args.service, args.serviceData);
  });
  connection.onRequest("checkConfig", async _ => {
    var result = await haConnection.callApi('post', 'config/core/check_config');
    connection.sendNotification("configuration_check_completed", result);
  });
  connection.onRequest("getErrorLog", async _ => {
    var result = await haConnection.callApi('get', 'error_log');
    connection.sendNotification("get_eror_log_completed", result);
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
