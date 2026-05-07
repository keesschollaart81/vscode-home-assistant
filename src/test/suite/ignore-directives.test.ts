import * as assert from "assert";
import { TextDocument, CompletionItem } from "vscode-languageserver-protocol";
import { HassEntities } from "home-assistant-js-websocket";
import { getLanguageService } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
import { HomeAssistantLanguageService } from "../../language-service/src/haLanguageService";
import { IHaConnection } from "../../language-service/src/home-assistant/haConnection";
import { HomeAssistantConfiguration } from "../../language-service/src/haConfig/haConfig";
import { SchemaServiceForIncludes } from "../../language-service/src/schemas/schemaService";
import { parseIgnoreDirectives } from "../../language-service/src/utils/commentDirectives";

class MockFileAccessor {
  getFileContents(): string {
    return "";
  }
}

class MockHaConnection implements IHaConnection {
  private mockEntities: HassEntities = {
    "light.kitchen": {
      entity_id: "light.kitchen",
      state: "off",
      attributes: { friendly_name: "Kitchen Light" },
      last_changed: "2023-01-01T00:00:00.000Z",
      last_updated: "2023-01-01T00:00:00.000Z",
      context: { id: "test", parent_id: null, user_id: null },
    },
  };

  async tryConnect(): Promise<void> { /* noop */ }
  async notifyConfigUpdate(): Promise<void> { /* noop */ }
  async getAreaCompletions(): Promise<CompletionItem[]> { return []; }
  async getDeviceCompletions(): Promise<CompletionItem[]> { return []; }
  async getDomainCompletions(): Promise<CompletionItem[]> { return []; }
  async getEntityCompletions(): Promise<CompletionItem[]> { return []; }
  async getFloorCompletions(): Promise<CompletionItem[]> { return []; }
  async getLabelCompletions(): Promise<CompletionItem[]> { return []; }
  async getServiceCompletions(): Promise<CompletionItem[]> { return []; }
  async getHassEntities(): Promise<HassEntities> { return this.mockEntities; }
  async getHassDevices(): Promise<any> { return {}; }
  async getHassEntityRegistry(): Promise<any> { return {}; }
  async getHassServices(): Promise<any> { return {}; }
  async resolveEntityCompletionDocumentation(_entityId: string): Promise<any> { return undefined; }
}

function makeDoc(content: string): TextDocument {
  return TextDocument.create("file:///test-ignore.yaml", "yaml", 1, content);
}

suite("Comment directive parser", () => {
  test("parses single-line file-wide ignore list", () => {
    const doc = makeDoc("# homeassistant:ignore light.one, light.two\n");
    const result = parseIgnoreDirectives(doc);
    assert.ok(result.ignoredIds.has("light.one"));
    assert.ok(result.ignoredIds.has("light.two"));
    assert.strictEqual(result.disabledLines.size, 0);
  });

  test("parses space-separated ignore list", () => {
    const doc = makeDoc("# homeassistant:ignore light.one light.two\n");
    const result = parseIgnoreDirectives(doc);
    assert.ok(result.ignoredIds.has("light.one"));
    assert.ok(result.ignoredIds.has("light.two"));
  });

  test("disable-next-line marks the following line disabled", () => {
    const doc = makeDoc(
      "# homeassistant:disable-next-line\nentity_id: light.fake\n",
    );
    const result = parseIgnoreDirectives(doc);
    assert.ok(result.disabledLines.has(1));
    assert.ok(!result.disabledLines.has(0));
  });

  test("disable-line marks the current line disabled", () => {
    const doc = makeDoc(
      "entity_id: light.fake  # homeassistant:disable-line\n",
    );
    const result = parseIgnoreDirectives(doc);
    assert.ok(result.disabledLines.has(0));
  });

  test("disable / enable defines a disabled range", () => {
    const doc = makeDoc(
      [
        "line0: ok",            // 0
        "# homeassistant:disable", // 1
        "line2: disabled",      // 2
        "line3: disabled",      // 3
        "# homeassistant:enable",  // 4
        "line5: ok",            // 5
      ].join("\n"),
    );
    const result = parseIgnoreDirectives(doc);
    assert.ok(!result.disabledLines.has(0));
    assert.ok(result.disabledLines.has(1));
    assert.ok(result.disabledLines.has(2));
    assert.ok(result.disabledLines.has(3));
    assert.ok(!result.disabledLines.has(4));
    assert.ok(!result.disabledLines.has(5));
  });

  test("multiple directives on one line are parsed independently", () => {
    const doc = makeDoc(
      "# homeassistant:ignore light.a homeassistant:disable-next-line\nline2\n",
    );
    const result = parseIgnoreDirectives(doc);
    assert.ok(result.ignoredIds.has("light.a"));
    assert.ok(result.disabledLines.has(1));
  });

  test("unknown directive names do not throw", () => {
    const doc = makeDoc("# homeassistant:something-unknown foo bar\n");
    const result = parseIgnoreDirectives(doc);
    assert.strictEqual(result.ignoredIds.size, 0);
    assert.strictEqual(result.disabledLines.size, 0);
  });

  test("files with no directives return empty sets", () => {
    const doc = makeDoc("entity_id: light.kitchen\n");
    const result = parseIgnoreDirectives(doc);
    assert.strictEqual(result.ignoredIds.size, 0);
    assert.strictEqual(result.disabledLines.size, 0);
  });
});

suite("Ignore directives applied to validation", () => {
  let languageService: HomeAssistantLanguageService;

  suiteSetup(async () => {
    const mockConnection = new MockHaConnection();
    const fileAccessor = new MockFileAccessor();
    const haConfig = new HomeAssistantConfiguration(fileAccessor as any);
    const yamlLanguageService = getLanguageService({
      schemaRequestService: async () => "",
      workspaceContext: null,
      telemetry: undefined,
    });

    languageService = new HomeAssistantLanguageService(
      yamlLanguageService,
      haConfig,
      mockConnection as any,
      [],
      await SchemaServiceForIncludes.create(),
      () => { /* noop */ },
      () => { /* noop */ },
      { isConfigured: true, autoRenderTemplates: true } as any,
    );
  });

  test("ignore by id suppresses only the listed entity", async () => {
    const content = `# homeassistant:ignore light.missing_a
automation:
  - alias: test
    trigger:
      - platform: state
        entity_id: light.missing_a
      - platform: state
        entity_id: light.missing_b
`;
    const document = makeDoc(content);
    const diagnostics = await languageService.getDiagnostics(document);
    const entityDiagnostics = diagnostics.filter(
      (d) => d.source === "home-assistant" && d.code === "unknown-entity",
    );
    const ids = entityDiagnostics.map(
      (d) => d.message.match(/'([^']+)'/)?.[1],
    );
    assert.ok(!ids.includes("light.missing_a"), "ignored id should be filtered");
    assert.ok(ids.includes("light.missing_b"), "non-ignored id should remain");
  });

  test("disable-next-line suppresses the following line only", async () => {
    const content = `automation:
  - alias: test
    action:
      - service: light.turn_on
        # homeassistant:disable-next-line
        entity_id: light.suppressed
      - service: light.turn_on
        entity_id: light.reported
`;
    const document = makeDoc(content);
    const diagnostics = await languageService.getDiagnostics(document);
    const ids = diagnostics
      .filter((d) => d.source === "home-assistant" && d.code === "unknown-entity")
      .map((d) => d.message.match(/'([^']+)'/)?.[1]);
    assert.ok(!ids.includes("light.suppressed"));
    assert.ok(ids.includes("light.reported"));
  });

  test("disable-line suppresses the current line only", async () => {
    const content = `automation:
  - alias: test
    action:
      - service: light.turn_on
        entity_id: light.suppressed  # homeassistant:disable-line
      - service: light.turn_on
        entity_id: light.reported
`;
    const document = makeDoc(content);
    const diagnostics = await languageService.getDiagnostics(document);
    const ids = diagnostics
      .filter((d) => d.source === "home-assistant" && d.code === "unknown-entity")
      .map((d) => d.message.match(/'([^']+)'/)?.[1]);
    assert.ok(!ids.includes("light.suppressed"));
    assert.ok(ids.includes("light.reported"));
  });

  test("disable/enable suppresses only lines in the range", async () => {
    const content = `automation:
  - alias: test
    action:
      # homeassistant:disable
      - service: light.turn_on
        entity_id: light.inside_a
      - service: light.turn_on
        entity_id: light.inside_b
      # homeassistant:enable
      - service: light.turn_on
        entity_id: light.outside
`;
    const document = makeDoc(content);
    const diagnostics = await languageService.getDiagnostics(document);
    const ids = diagnostics
      .filter((d) => d.source === "home-assistant" && d.code === "unknown-entity")
      .map((d) => d.message.match(/'([^']+)'/)?.[1]);
    assert.ok(!ids.includes("light.inside_a"));
    assert.ok(!ids.includes("light.inside_b"));
    assert.ok(ids.includes("light.outside"));
  });
});
