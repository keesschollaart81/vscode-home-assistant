import { Definition, DefinitionLink } from "vscode-languageserver-protocol";

export interface DefinitionProvider {
  onDefinition(line: string, uri: string): Promise<Definition[]>;
}
