import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  ServerCapabilities,
  TextDocumentSyncKind,
  Diagnostic,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { getLanguageService } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
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

const connection = createConnection(ProposedFeatures.all);

console.log = connection.console.log.bind(connection.console);
console.warn = connection.window.showWarningMessage.bind(connection.window);
console.error = connection.window.showErrorMessage.bind(connection.window);

const documents = new TextDocuments(TextDocument);
documents.listen(connection);

connection.onInitialize((params) => {
  connection.console.log(
    `[Home Assistant Language Server(${process.pid})] Started and initialize received`,
  );

  const configurationService = new ConfigurationService();
  const haConnection = new HaConnection(configurationService);
  const fileAccessor = new VsCodeFileAccessor(params.rootUri, documents);
  const haConfig = new HomeAssistantConfiguration(fileAccessor);

  const definitionProviders = [
    new IncludeDefinitionProvider(fileAccessor),
    new ScriptDefinitionProvider(haConfig),
  ];

  const jsonWorkerContributions = [
    new EntityIdCompletionContribution(haConnection),
    new ServicesCompletionContribution(haConnection),
  ];

  const schemaServiceForIncludes = new SchemaServiceForIncludes();

  const yamlLanguageService = getLanguageService(
    // eslint-disable-next-line @typescript-eslint/require-await
    async () => "",
    null,
    jsonWorkerContributions,
  );

  const sendDiagnostics = (uri: string, diagnostics: Diagnostic[]) => {
    connection.sendDiagnostics({
      uri,
      diagnostics,
    });
  };

  const discoverFilesAndUpdateSchemas = async () => {
    try {
      await haConfig.discoverFiles();
      homeAsisstantLanguageService.findAndApplySchemas();
    } catch (e) {
      console.error(
        `Unexpected error during file discovery / schema configuration: ${e}`,
      );
    }
  };

  const homeAsisstantLanguageService = new HomeAssistantLanguageService(
    yamlLanguageService,
    haConfig,
    haConnection,
    definitionProviders,
    schemaServiceForIncludes,
    sendDiagnostics,
    () => {
      documents.all().forEach(async (d) => {
        const diagnostics =
          await homeAsisstantLanguageService.getDiagnostics(d);
        sendDiagnostics(d.uri, diagnostics);
      });
    },
  );

  documents.onDidChangeContent((e) =>
    homeAsisstantLanguageService.onDocumentChange(e),
  );
  documents.onDidOpen((e) => homeAsisstantLanguageService.onDocumentOpen(e));

  let onDidSaveDebounce: NodeJS.Timer;
  documents.onDidSave(() => {
    clearTimeout(onDidSaveDebounce);
    onDidSaveDebounce = setTimeout(discoverFilesAndUpdateSchemas, 100);
  });

  connection.onDocumentSymbol((p) =>
    homeAsisstantLanguageService.onDocumentSymbol(
      documents.get(p.textDocument.uri),
    ),
  );
  connection.onDocumentFormatting((p) =>
    homeAsisstantLanguageService.onDocumentFormatting(
      documents.get(p.textDocument.uri),
      p.options,
    ),
  );
  connection.onCompletion((p) =>
    homeAsisstantLanguageService.onCompletion(
      documents.get(p.textDocument.uri),
      p.position,
    ),
  );
  connection.onCompletionResolve((p) =>
    homeAsisstantLanguageService.onCompletionResolve(p),
  );
  connection.onHover((p) =>
    homeAsisstantLanguageService.onHover(
      documents.get(p.textDocument.uri),
      p.position,
    ),
  );
  connection.onDefinition((p) =>
    homeAsisstantLanguageService.onDefinition(
      documents.get(p.textDocument.uri),
      p.position,
    ),
  );

  connection.onDidChangeConfiguration(async (config) => {
    configurationService.updateConfiguration(config);
    await haConnection.notifyConfigUpdate();

    if (!configurationService.isConfigured) {
      connection.sendNotification("no-config");
    }
  });

  connection.onRequest(
    "callService",
    (args: { domain: string; service: string; serviceData?: any }) => {
      void haConnection.callService(
        args.domain,
        args.service,
        args.serviceData,
      );
    },
  );

  connection.onRequest("checkConfig", async (_) => {
    const result = await haConnection.callApi(
      "post",
      "config/core/check_config",
    );
    connection.sendNotification("configuration_check_completed", result);
  });
  connection.onRequest("getErrorLog", async (_) => {
    const result = await haConnection.callApi("get", "error_log");
    connection.sendNotification("get_eror_log_completed", result);
  });
  connection.onRequest("renderTemplate", async (args: { template: string }) => {
    const result = await haConnection.callApi("post", "template", {
      template: args.template,
      strict: true,
    });

    const timePrefix = `[${new Date().toLocaleTimeString()}] `;
    let outputString = `${timePrefix}Rendering template:\n${args.template}\n\n`;
    outputString += `Result:\n${result}`;

    connection.sendNotification("render_template_completed", outputString);
  });

  // fire and forget
  setTimeout(discoverFilesAndUpdateSchemas, 0);

  return {
    capabilities: <ServerCapabilities>{
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: { triggerCharacters: [" "], resolveProvider: true },
      hoverProvider: true,
      documentSymbolProvider: true,
      documentFormattingProvider: true,
      definitionProvider: true,
    },
  };
});

connection.listen();
