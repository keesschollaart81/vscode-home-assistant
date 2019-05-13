import { Definition, DefinitionLink } from "vscode-languageserver";

export interface DefinitionProvider {
    onDefinition(line: string, uri: string): Promise<Definition[]>;
}