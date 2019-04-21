import * as path from "path";
import { parse as parseYAML } from "yaml-language-server/out/server/src/languageservice/parser/yamlParser";
import { YAMLValidation } from "yaml-language-server/out/server/src/languageservice/services/yamlValidation";
import { JSONSchemaService } from "yaml-language-server/out/server/src/languageservice/services/jsonSchemaService";
import {
  createConnection,
  TextDocuments,
  ProposedFeatures
} from "vscode-languageserver";

import {
  NestedYamlParser,
  VsCodeFileAccessor,
  SchemaServiceForIncludes,
  Includetype
} from "./yamlDiscovery";

let connection = createConnection(ProposedFeatures.all);
let documents = new TextDocuments();
let workspaceFolder: string | null;
let parser: NestedYamlParser | null;
let schemaServiceForIncludes: SchemaServiceForIncludes | null;
let yamlvalidation: YAMLValidation | null;

documents.listen(connection);

connection.onInitialize(params => {
  workspaceFolder = params.rootUri;

  var vsCodeFileAccessor = new VsCodeFileAccessor(workspaceFolder, connection);
  parser = new NestedYamlParser(vsCodeFileAccessor);

  let workspaceContext = {
    resolveRelativePath: (relativePath: string, resource: string) => {
      return path.resolve(resource, relativePath);
    }
  };

  let jsonSchemaService = new JSONSchemaService(null, workspaceContext, null);
  schemaServiceForIncludes = new SchemaServiceForIncludes(jsonSchemaService);

  yamlvalidation = new YAMLValidation(jsonSchemaService);
  yamlvalidation.configure({
    validate: true
  });

  connection.console.log(
    `[Server(${
      process.pid
    }) ${workspaceFolder}] Started and initialize received`
  );
  return {
    capabilities: {
      textDocumentSync: {
        openClose: true,
        change: documents.syncKind
      }
    }
  };
});

documents.onDidChangeContent(async textDocumentChangeEvent => {
  if (!textDocumentChangeEvent.document) {
    return;
  }

  var parseResult = await parser.parse([
    path.join(workspaceFolder, "configuration.yaml"),
    path.join(workspaceFolder, "ui-lovelace.yaml")
  ]);

  schemaServiceForIncludes.onUpdate(parseResult.filePathMappings);

  if (textDocumentChangeEvent.document.getText().length === 0) {
    return;
  }

  let yamlDocument = parseYAML(textDocumentChangeEvent.document.getText(), getValidYamlTags());
  if (!yamlDocument) {
    return;
  }
  var diagnosticResults = await yamlvalidation.doValidation(
    textDocumentChangeEvent.document,
    yamlDocument
  );

  if (!diagnosticResults) {
    return;
  }
  let diagnostics = [];
  for (let diagnosticItem in diagnosticResults) {
    diagnosticResults[diagnosticItem].severity = 1; //Convert all warnings to errors
    diagnostics.push(diagnosticResults[diagnosticItem]);
  }
  connection.sendDiagnostics({
    uri: textDocumentChangeEvent.document.uri,
    diagnostics: diagnostics
  });
});

documents.onDidOpen(event => {
  connection.console.log(
    `[Server(${process.pid}) ${workspaceFolder}] Document opened: ${
      event.document.uri
    }`
  );
});

function getValidYamlTags() : string[] {
  var validTags: string[] = [];
  for (let item in Includetype) {
    if (isNaN(Number(item))) {
        validTags.push(`!${item} scalar`);
    }
  }
  validTags.push("!secret scalar");
  return validTags;
}
connection.listen();
