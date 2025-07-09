import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  ServerCapabilities,
  TextDocumentSyncKind,
  Diagnostic,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { getLanguageService } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
import { HaConnection } from "../language-service/src/home-assistant/haConnection";
import { ConfigurationService } from "../language-service/src/configuration";
import { HomeAssistantConfiguration } from "../language-service/src/haConfig/haConfig";
import { HomeAssistantLanguageService } from "../language-service/src/haLanguageService";
import { SchemaServiceForIncludes } from "../language-service/src/schemas/schemaService";
import { IncludeDefinitionProvider } from "../language-service/src/definition/includes";
import { ScriptDefinitionProvider } from "../language-service/src/definition/scripts";
import { SecretsDefinitionProvider } from "../language-service/src/definition/secrets";
import { VsCodeFileAccessor } from "./fileAccessor";

const connection = createConnection(ProposedFeatures.all, undefined, undefined);

console.log = connection.console.log.bind(connection.console);
console.warn = connection.window.showWarningMessage.bind(connection.window);
console.error = connection.window.showErrorMessage.bind(connection.window);

const documents = new TextDocuments(TextDocument);
documents.listen(connection);

connection.onInitialize((params) => {
  connection.console.log(
    `[Home Assistant Language Server(${process.pid})] Started and initialize received`,
  );

  // Check if initialization contains the token in custom data
  const haConfig = params.initializationOptions && params.initializationOptions["vscode-home-assistant"];
  
  if (haConfig) {
    // Extract token
    if (haConfig.longLivedAccessToken) {
      const token = haConfig.longLivedAccessToken;
      console.log(`Token provided in initialization options (length: ${token.length}, first 5 chars: ${token.substring(0, 5)}...)`);
      process.env.HASS_TOKEN = token; // Set as environment variable for backup
    } else {
      console.log("No token provided in initialization options");
    }
    
    // Extract Home Assistant instance URL
    if (haConfig.hostUrl) {
      console.log(`Home Assistant instance URL provided in initialization options: ${haConfig.hostUrl}`);
      process.env.HASS_SERVER = haConfig.hostUrl;
    } else {
      console.log("No Home Assistant instance URL provided in initialization options");
    }
  } else {
    console.log("No Home Assistant configuration in initialization options");
  }

  const configurationService = new ConfigurationService();
  const haConnection = new HaConnection(configurationService);
  const fileAccessor = new VsCodeFileAccessor(params.rootUri, documents);
  const haConfigInstance = new HomeAssistantConfiguration(fileAccessor);

  const definitionProviders = [
    new IncludeDefinitionProvider(fileAccessor),
    new ScriptDefinitionProvider(haConfigInstance),
    new SecretsDefinitionProvider(fileAccessor),
  ];

  const yamlLanguageService = getLanguageService({
    schemaRequestService: async () => "",
    workspaceContext: null,
    telemetry: undefined,
  });

  const sendDiagnostics = (uri: string, diagnostics: Diagnostic[]) => {
    connection.sendDiagnostics({
      uri,
      diagnostics,
    });
  };

  const discoverFilesAndUpdateSchemas = async () => {
    try {
      console.log("Discovering files and updating schemas...");
      await haConfigInstance.discoverFiles();
      await homeAsisstantLanguageService.findAndApplySchemas();
      console.log("Files discovered and schemas updated successfully");
    } catch (e) {
      console.error(
        `Unexpected error during file discovery / schema configuration: ${e}`,
      );
    }
  };

  const homeAsisstantLanguageService = new HomeAssistantLanguageService(
    yamlLanguageService,
    haConfigInstance,
    haConnection,
    definitionProviders,
    new SchemaServiceForIncludes(),
    sendDiagnostics,
    () => {
      documents.all().forEach(async (d) => {
        const diagnostics =
          await homeAsisstantLanguageService.getDiagnostics(d);
        sendDiagnostics(d.uri, diagnostics);
      });
    },
    configurationService,
  );

  // Setup handlers to notify client about connection status
  haConnection.onConnectionEstablished = (info) => {
    console.log("Home Assistant connection established, notifying client");
    connection.sendNotification("ha_connected", info);
  };
  
  haConnection.onConnectionFailed = (error) => {
    console.log("Home Assistant connection failed, notifying client");
    connection.sendNotification("ha_connection_error", { error: error || "Unknown error" });
  };

  documents.onDidChangeContent((e) =>
    homeAsisstantLanguageService.onDocumentChange(e.document),
  );
  documents.onDidOpen((e) =>
    homeAsisstantLanguageService.onDocumentOpen(e.document),
  );

  let onDidSaveDebounce: NodeJS.Timeout;
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
    console.log("Received configuration change from VS Code");
    
    // Check for token in incoming configuration before applying changes
    const haConfig = config.settings && config.settings["vscode-home-assistant"];
    if (haConfig) {
      if (haConfig.longLivedAccessToken) {
        const token = haConfig.longLivedAccessToken;
        console.log(`Token received in configuration update (length: ${token.length}, first 5 chars: ${token.substring(0, 5)}...)`);
      } else {
        console.log("No token in configuration update");
      }
      
      if (haConfig.hostUrl) {
        console.log(`Home Assistant instance URL in configuration update: ${haConfig.hostUrl}`);
      } else {
        console.log("No Home Assistant instance URL in configuration update");
      }
    } else {
      console.log("No Home Assistant configuration in update");
    }
    
    // Update the configuration service with the new settings
    configurationService.updateConfiguration(config);
    
    // Notify connection handler to update connection if needed
    await haConnection.notifyConfigUpdate();

    // Check configuration status after update
    if (!configurationService.isConfigured) {
      console.log("Configuration incomplete after update, sending no-config notification");
      connection.sendNotification("no-config");
    } else {
      console.log("Configuration is valid after update");
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
    const timePrefix = `[${new Date().toLocaleTimeString()}] `;
    let outputString = `${timePrefix}Rendering template:\n${args.template}\n\n`;
    
    try {
      const result = await haConnection.callApi("post", "template", {
        template: args.template,
        strict: true,
      });
      
      // Check if the result is an error object
      if (result && typeof result === "object") {
        if (result.error) {
          // Direct error message
          outputString += `Error:\n${result.error}`;
        } else if (result.message) {
          // Error message in message field
          outputString += `Error:\n${result.message}`;
        } else if (Object.keys(result).length > 0) {
          // For other types of error objects, get a formatted representation
          const errorMessage = JSON.stringify(result, null, 2);
          outputString += `Error:\n${errorMessage}`;
        } else {
          // Just a string representation as fallback
          outputString += `Result:\n${result}`;
        }
      } else {
        outputString += `Result:\n${result}`;
      }
    } catch (error) {
      // Handle API errors or exceptions
      let errorMessage = "Unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        try {
          // Try to convert error object to a readable string
          errorMessage = JSON.stringify(error, null, 2);
        } catch {
          // If JSON conversion fails, try to extract properties
          if ("message" in error) {
            errorMessage = error.message;
          } else if ("toString" in error && typeof error.toString === "function") {
            errorMessage = error.toString();
          }
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      outputString += `Error:\n${errorMessage}`;
    }

    connection.sendNotification("render_template_completed", outputString);
  });

  // fire and forget
  setTimeout(discoverFilesAndUpdateSchemas, 0);

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: { triggerCharacters: [" "], resolveProvider: true },
      hoverProvider: true,
      documentSymbolProvider: true,
      documentFormattingProvider: true,
      definitionProvider: true,
    } as ServerCapabilities,
  };
});

connection.listen();
