import { createConnection, TextDocuments, ProposedFeatures, ServerCapabilities, TextDocumentChangeEvent } from "vscode-languageserver";
import { VsCodeFileAccessor } from "./fileAccessor";
import { HomeAssistantLanguageService } from "./haLanguageService";
import { YamlIncludeDiscoveryService } from "./yamlIncludeDiscoveryService";

let connection = createConnection(ProposedFeatures.all);
let documents = new TextDocuments();
documents.listen(connection);

connection.onInitialize(async params => {

  connection.console.log(`[Server(${process.pid})] Started and initialize received`);

  var vsCodeFileAccessor = new VsCodeFileAccessor(params.rootUri, connection);
  var yamlIncludeDiscoveryService = new YamlIncludeDiscoveryService(vsCodeFileAccessor);

  var homeAsisstantLanguageService = new HomeAssistantLanguageService(
    documents,
    params.rootUri,
    yamlIncludeDiscoveryService
  ); 
  await homeAsisstantLanguageService.triggerSchemaLoad();

  var triggerValidation = async (e: TextDocumentChangeEvent) =>{
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

  connection.onDocumentSymbol(homeAsisstantLanguageService.onDocumentSymbol);
  connection.onDocumentFormatting(homeAsisstantLanguageService.onDocumentFormatting);
  connection.onCompletion(homeAsisstantLanguageService.onCompletion);
  connection.onCompletionResolve(homeAsisstantLanguageService.onCompletionResolve); 
  connection.onHover(homeAsisstantLanguageService.onHover);
  connection.onDidChangeWatchedFiles(homeAsisstantLanguageService.onDidChangeWatchedFiles); 

  return {
    capabilities: <ServerCapabilities>{
      textDocumentSync: documents.syncKind,
      completionProvider: { resolveProvider: true },
      hoverProvider: true,
      documentSymbolProvider: true,
      documentFormattingProvider: true
    }
  };
});

connection.listen();
