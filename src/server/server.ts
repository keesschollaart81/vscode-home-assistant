import { createConnection, TextDocuments, ProposedFeatures } from "vscode-languageserver";
import { NestedYamlParser, VsCodeFileAccessor } from "./yamlDiscovery";
import { HomeAssistantLanguageService } from "./haLanguageService";

let connection = createConnection(ProposedFeatures.all);
let documents = new TextDocuments();
documents.listen(connection);

connection.onInitialize(params => {

  connection.console.log(`[Server(${process.pid})] Started and initialize received`);

  var vsCodeFileAccessor = new VsCodeFileAccessor(params.rootUri, connection);
  var nestedYamlParser = new NestedYamlParser(vsCodeFileAccessor);

  var homeAsisstantLanguageService = new HomeAssistantLanguageService(
    documents,
    params.rootUri,
    nestedYamlParser
  );

  documents.onDidChangeContent(async e => {
    var diagnostics = await homeAsisstantLanguageService.onDidChangeContent(e);
    connection.sendDiagnostics({
      uri: e.document.uri,
      diagnostics: diagnostics
    });
  });

  connection.onDocumentSymbol(homeAsisstantLanguageService.onDocumentSymbol);
  connection.onDocumentFormatting(homeAsisstantLanguageService.onDocumentFormatting);
  connection.onCompletion(homeAsisstantLanguageService.onCompletion);
  connection.onCompletionResolve(homeAsisstantLanguageService.onCompletionResolve);
  connection.onCompletionResolve(homeAsisstantLanguageService.onCompletionResolve);
  connection.onHover(homeAsisstantLanguageService.onHover);

  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
      completionProvider: { resolveProvider: true },
      hoverProvider: true,
      documentSymbolProvider: true,
      documentFormattingProvider: true
    }
  };
});

connection.listen();
