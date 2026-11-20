import * as assert from "assert";
import { HomeAssistantLanguageService } from "../../language-service/src/haLanguageService";
import { Position, TextDocument } from "vscode-languageserver-protocol";
import { HomeAssistantConfiguration } from "../../language-service/src/haConfig/haConfig";
import { getLanguageService } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
import { SchemaServiceForIncludes } from "../../language-service/src/schemas/schemaService";
import { AreaCompletionContribution } from "../../language-service/src/completionHelpers/areas";
import { DomainCompletionContribution } from "../../language-service/src/completionHelpers/domains";
import { EntityIdCompletionContribution } from "../../language-service/src/completionHelpers/entityIds";
import { FloorCompletionContribution } from "../../language-service/src/completionHelpers/floors";
import { LabelCompletionContribution } from "../../language-service/src/completionHelpers/labels";
import { ServicesCompletionContribution } from "../../language-service/src/completionHelpers/services";
import { UuidCompletionContribution } from "../../language-service/src/completionHelpers/uuids";

class MockFileAccessor {
  getFileContents(): string {
    return "";
  }
}

// The same provider map getAdditionalCompletions() passes in.
const properties: { [provider: string]: string[] } = {
  areas: AreaCompletionContribution.propertyMatches,
  entities: EntityIdCompletionContribution.propertyMatches,
  floors: FloorCompletionContribution.propertyMatches,
  labels: LabelCompletionContribution.propertyMatches,
  services: ServicesCompletionContribution.propertyMatches,
  domains: DomainCompletionContribution.propertyMatches,
  uuids: UuidCompletionContribution.propertyMatches,
};

suite("Completion property lookup across comments and blank lines", () => {
  let languageService: HomeAssistantLanguageService;

  suiteSetup(async () => {
    const haConfig = new HomeAssistantConfiguration(new MockFileAccessor() as any);
    const yamlLanguageService = getLanguageService({
      schemaRequestService: async () => "",
      workspaceContext: null,
      telemetry: undefined,
    });

    languageService = new HomeAssistantLanguageService(
      yamlLanguageService,
      haConfig,
      {} as any, // findAutoCompletionProperty never touches the connection
      [],
      await SchemaServiceForIncludes.create(),
      () => { /* mock sendDiagnostics */ },
      () => { /* mock diagnoseAllFiles */ },
      { isConfigured: true, autoRenderTemplates: true } as any,
    );
  });

  // The cursor goes at the end of the last line, the list item being typed.
  function findProperty(lines: string[]): string | null {
    const document = TextDocument.create(
      "file:///test.yaml",
      "yaml",
      1,
      lines.join("\n"),
    );
    const lastLine = lines.length - 1;
    const position = Position.create(lastLine, lines[lastLine].length);
    return (languageService as any).findAutoCompletionProperty(
      document,
      position,
      properties,
    );
  }

  test("baseline: plain list items find the owning key", () => {
    assert.strictEqual(
      findProperty([
        "include_entities:",
        "  - light.kitchen_ceiling",
        "  - ",
      ]),
      "entities",
    );
  });

  test("a list item with a trailing comment does not stop the search", () => {
    assert.strictEqual(
      findProperty([
        "include_entities:",
        "  - light.kitchen_ceiling # Kitchen",
        "  - ",
      ]),
      "entities",
    );
  });

  test("a blank line does not stop the search", () => {
    assert.strictEqual(
      findProperty([
        "include_entities:",
        "  - light.kitchen_ceiling",
        "",
        "  - ",
      ]),
      "entities",
    );
  });

  test("a full-line comment does not stop the search", () => {
    assert.strictEqual(
      findProperty([
        "include_entities:",
        "  # === Ground floor ===",
        "  - light.kitchen_ceiling",
        "  # === First floor ===",
        "  - ",
      ]),
      "entities",
    );
  });

  test("a comment containing -- does not stop the search", () => {
    assert.strictEqual(
      findProperty([
        "include_entities:",
        "  # -- Ground floor (hallway)",
        "  - switch.hallway_fan # fan -- summer only",
        "  - ",
      ]),
      "entities",
    );
  });

  test("a trailing comment on the key itself still matches the key", () => {
    assert.strictEqual(
      findProperty([
        "include_entities: # shown in the app",
        "  - light.kitchen_ceiling",
        "  - ",
      ]),
      "entities",
    );
  });

  test("all of the above together, as in a sectioned filter list", () => {
    assert.strictEqual(
      findProperty([
        "homekit:",
        "  - filter:",
        "      include_entities:",
        "        # === Ground floor ===",
        "        - light.kitchen_ceiling # Kitchen",
        "        - switch.hallway_fan",
        "",
        "        # === First floor ===",
        "        - light.bedroom_lamp # Bedroom",
        "        - ",
      ]),
      "entities",
    );
  });

  test("a list under a non-entity key still returns null", () => {
    assert.strictEqual(
      findProperty([
        "include_entity_globs:",
        "  # === Lights ===",
        "  - light.kitchen_ceiling # Kitchen",
        "",
        "  - ",
      ]),
      null,
    );
  });
});
