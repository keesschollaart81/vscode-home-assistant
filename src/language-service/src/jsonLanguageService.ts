import { TextDocument, TextEdit, Diagnostic, ColorInformation, ColorPresentation, DocumentSymbol } from "vscode-languageserver-protocol";
import { IJSONSchemaService } from "vscode-json-languageservice/lib/umd/services/jsonSchemaService"
import { JSONValidation } from "vscode-json-languageservice/lib/umd/services/jsonValidation";
import { JSONHover } from "vscode-json-languageservice/lib/umd/services/jsonHover";
import { JSONDocumentSymbols } from "vscode-json-languageservice/lib/umd/services/jsonDocumentSymbols";
import { LanguageSettings } from "vscode-json-languageservice/lib/umd/jsonLanguageTypes"
import { JSONWorkerContribution, SymbolInformation, Hover, CompletionItem, CompletionList, LanguageService, JSONDocument, Color, Position, Range, FormattingOptions, FoldingRange, SelectionRange, ASTNode, DocumentLanguageSettings, JSONSchema, Thenable } from "vscode-json-languageservice";

export class JsonLanguageService implements LanguageService {

    jsonValidation: JSONValidation;
    jsonHover: JSONHover;
    jsonDocumentSymbols: JSONDocumentSymbols;

    constructor(jsonSchemaService: IJSONSchemaService, jsonWorkerContributions: JSONWorkerContribution[]) {
        this.jsonValidation = new JSONValidation(jsonSchemaService, Promise);
        this.jsonHover = new JSONHover(jsonSchemaService, jsonWorkerContributions, Promise);
        this.jsonDocumentSymbols = new JSONDocumentSymbols(jsonSchemaService);
    }

    public async doValidation(document: TextDocument, jsonDocument: JSONDocument, documentSettings?: DocumentLanguageSettings, schema?: JSONSchema): Promise<Diagnostic[]> {
        return await this.jsonValidation.doValidation(document, jsonDocument, documentSettings, schema);
    }

    public findDocumentSymbols(document: TextDocument, doc: JSONDocument): SymbolInformation[] {
        return this.jsonDocumentSymbols.findDocumentSymbols(document, doc);
    }

    public findDocumentSymbols2(document: TextDocument, doc: JSONDocument): DocumentSymbol[] {
        return this.jsonDocumentSymbols.findDocumentSymbols2(document, doc);
    }

    public async findColorSymbols(document: TextDocument, doc: JSONDocument): Promise<Range[]> {
        return await this.jsonDocumentSymbols.findColorSymbols(document, doc);
    }

    public async findDocumentColors(document: TextDocument, doc: JSONDocument): Promise<ColorInformation[]> {
        return await this.jsonDocumentSymbols.findDocumentColors(document, doc);
    }

    public getColorPresentations(document: TextDocument, doc: JSONDocument, color: Color, range: Range): ColorPresentation[] {
        return this.jsonDocumentSymbols.getColorPresentations(document, doc, color, range);
    }

    public async doHover(document: TextDocument, position: Position, doc: JSONDocument): Promise<Hover> {
        return await this.jsonHover.doHover(document, position, doc);
    }

    // Methods below are not implemented since the YAML Language Service does not use them

    configure(settings: LanguageSettings): void {
        throw new Error("Method not implemented.");
    }
    parseJSONDocument(document: TextDocument): JSONDocument {
        throw new Error("Method not implemented.");
    }
    newJSONDocument(rootNode: ASTNode, syntaxDiagnostics?: Diagnostic[]): JSONDocument {
        throw new Error("Method not implemented.");
    }
    resetSchema(uri: string): boolean {
        throw new Error("Method not implemented.");
    }
    doResolve(item: CompletionItem): Thenable<CompletionItem> {
        throw new Error("Method not implemented.");
    }
    doComplete(document: TextDocument, position: Position, doc: JSONDocument): Thenable<CompletionList> {
        throw new Error("Method not implemented.");
    }
    format(document: TextDocument, range: Range, options: FormattingOptions): TextEdit[] {
        throw new Error("Method not implemented.");
    }
    getFoldingRanges(document: TextDocument, context?: { rangeLimit?: number; }): FoldingRange[] {
        throw new Error("Method not implemented.");
    }
    getSelectionRanges(document: TextDocument, positions: Position[], doc: JSONDocument): SelectionRange[] {
        throw new Error("Method not implemented.");
    }
}
