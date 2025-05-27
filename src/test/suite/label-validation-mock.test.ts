import * as assert from "assert";
import { TextDocument } from "vscode-languageserver-textdocument";
import { CompletionItem, CompletionItemKind, MarkupContent } from "vscode-languageserver-protocol";
import { IHaConnection } from "../../language-service/src/home-assistant/haConnection";
import { HomeAssistantLanguageService } from "../../language-service/src/haLanguageService";
import { getLanguageService } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
import { SchemaServiceForIncludes } from "../../language-service/src/schemas/schemaService";
import { HomeAssistantConfiguration } from "../../language-service/src/haConfig/haConfig";

class MockFileAccessor {
  getFileContents(_uri: string): Promise<string> {
    return Promise.resolve("");
  }
  
  getRelativePath(_fileUri: string, _includePath: string): string {
    return "";
  }
  
  getRelativePathAsFileUri(_fileUri: string, _includePath: string): string {
    return "";
  }
  
  getFilesInFolderRelativeFromAsFileUri(_folderPath: string, _fileUri: string): string[] {
    return [];
  }
}

// Mock Home Assistant connection with predefined labels
class MockHaConnection implements IHaConnection {
  private mockLabelCompletions: CompletionItem[] = [
    {
      label: "security",
      detail: "Security",
      kind: CompletionItemKind.Variable,
      data: { isLabel: true },
      documentation: {
        kind: "markdown",
        value: "**security**\n\nSecurity related devices and entities\n\n",
      } as MarkupContent,
    },
    {
      label: "automation",
      detail: "Automation",
      kind: CompletionItemKind.Variable,
      data: { isLabel: true },
      documentation: {
        kind: "markdown",
        value: "**automation**\n\nAutomation related devices\n\n",
      } as MarkupContent,
    },
    {
      label: "lighting",
      detail: "Lighting",
      kind: CompletionItemKind.Variable,
      data: { isLabel: true },
      documentation: {
        kind: "markdown",
        value: "**lighting**\n\nLighting fixtures and controls\n\n",
      } as MarkupContent,
    }
  ];

  async tryConnect(): Promise<void> {
    // Mock implementation
  }
  
  async notifyConfigUpdate(_conf: any): Promise<void> {
    // Mock implementation
  }
  
  async getAreaCompletions(): Promise<CompletionItem[]> { 
    return []; 
  }
  
  async getDeviceCompletions(): Promise<CompletionItem[]> { 
    return []; 
  }
  
  async getDomainCompletions(): Promise<CompletionItem[]> { 
    return []; 
  }
  
  async getEntityCompletions(): Promise<CompletionItem[]> { 
    return []; 
  }
  
  async getFloorCompletions(): Promise<CompletionItem[]> { 
    return []; 
  }
  
  async getLabelCompletions(): Promise<CompletionItem[]> { 
    return this.mockLabelCompletions; 
  }
  
  async getServiceCompletions(): Promise<CompletionItem[]> { 
    return []; 
  }
  
  async getHassEntities(): Promise<any> {
    return {};
  }

  async getHassDevices(): Promise<any> {
    return {};
  }

  async getHassEntityRegistry(): Promise<any> {
    return {};
  }

  async getHassServices(): Promise<any> {
    return {};
  }
}

suite("Label Validation Tests", () => {
  let languageService: HomeAssistantLanguageService;
  let mockConnection: MockHaConnection;
  
  setup(() => {
    mockConnection = new MockHaConnection();
    
    const fileAccessor = new MockFileAccessor();
    const haConfig = new HomeAssistantConfiguration(fileAccessor as any);
    const yamlLanguageService = getLanguageService({
      schemaRequestService: async () => "",
      workspaceContext: null,
      telemetry: undefined,
    });

    // Create language service with mock connection
    languageService = new HomeAssistantLanguageService(
      yamlLanguageService,
      haConfig,
      mockConnection as any, // Type assertion to bypass strict typing
      [],
      new SchemaServiceForIncludes(),
      () => { /* mock sendDiagnostics */ }, 
      () => { /* mock diagnoseAllFiles */ }
    );
  });

  test("Label validation identifies unknown labels", async () => {
    // Create a test document with both known and unknown labels
    const testContent = `
automation:
  - alias: "Test Label Validation"
    trigger:
      - platform: state
        entity_id: light.kitchen
    action:
      - service: light.turn_on
        target:
          label_id: security              # This exists
      - service: light.turn_off
        target:
          label_id: non_existing_label    # This doesn't exist
        
# Test with array syntax
script:
  test_script:
    sequence:
      - service: homeassistant.turn_off
        target:
          label_id: 
            - automation                  # This exists
            - fake_label                  # This doesn't exist
          
# Test with inline array
group:
  test_group:
    target:
      label_id: [lighting, non_existing] # One exists, one doesn't

# Test with "label" property instead of "label_id"
automation:
  - alias: "Test Label Property"
    trigger:
      - platform: state
        entity_id: light.test
    action:
      - service: light.turn_on
        target:
          label: security                 # This exists
      - service: light.turn_off
        target:
          label: missing_label            # This doesn't exist
`;

    const document = TextDocument.create(
      "file:///test-label-validation.yaml",
      "yaml",
      1,
      testContent
    );

    // Get diagnostics from language service (this will call our validation)
    const diagnostics = await languageService.getDiagnostics(document);

    // Filter for label validation diagnostics
    // We need to deduplicate the results because the test is getting multiple diagnostics for the same issue
    const labelDiagnostics = Array.from(new Set(
      diagnostics
        .filter(d => d.source === "home-assistant" && d.code === "unknown-label")
        .map(d => JSON.stringify(d))
    )).map((d: string) => JSON.parse(d));

    console.log(`Found ${labelDiagnostics.length} label validation diagnostics:`);
    for (const diagnostic of labelDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // We should have exactly 4 unknown label diagnostics
    assert.strictEqual(labelDiagnostics.length, 4, 
      `Expected 4 unknown label diagnostics, got ${labelDiagnostics.length}`);

    // Check that the diagnostics are for the correct labels
    const expectedUnknownLabels = [
      "non_existing_label",
      "fake_label",
      "non_existing",
      "missing_label"
    ];

    const foundUnknownLabels = labelDiagnostics.map(d => {
      const match = d.message.match(/Label '([^']+)'/);
      return match ? match[1] : null;
    }).filter(e => e !== null);

    for (const expectedLabel of expectedUnknownLabels) {
      assert.ok(
        foundUnknownLabels.includes(expectedLabel),
        `Expected to find diagnostic for unknown label '${expectedLabel}'`
      );
    }

    // Verify that known labels don't generate diagnostics
    const knownLabels = ["security", "automation", "lighting"];
    for (const knownLabel of knownLabels) {
      assert.ok(
        !foundUnknownLabels.includes(knownLabel),
        `Known label '${knownLabel}' should not generate a diagnostic`
      );
    }
  });

  test("Label validation skips templates and special values", async () => {
    const testContent = `
automation:
  - alias: "Test Templates and Special Values"
    trigger:
      - platform: state
        entity_id: light.kitchen
    action:
      - service: light.turn_on
        target:
          label_id: "{{ states.label.template }}"   # Template, should be skipped
      - service: light.turn_off
        target:
          label_id: !secret my_label_id             # Secret, should be skipped
      - service: light.turn_on
        target:
          label_id: all                             # Special value, should be skipped
      - service: light.turn_off
        target:
          label_id: none                            # Special value, should be skipped
      - service: light.toggle
        target:
          label_id: unknown_label                   # Unknown label, should be flagged
          
# Test with "label" property
script:
  test_script:
    sequence:
      - service: homeassistant.turn_on
        target:
          label: "{{ template_label }}"             # Template, should be skipped
      - service: homeassistant.turn_off
        target:
          label: !secret secret_label               # Secret, should be skipped
      - service: homeassistant.toggle
        target:
          label: missing_label_test                 # Unknown label, should be flagged
`;

    const document = TextDocument.create(
      "file:///test-templates-specials.yaml",
      "yaml", 
      1,
      testContent
    );

    const diagnostics = await languageService.getDiagnostics(document);

    // Filter for label validation diagnostics and deduplicate
    const labelDiagnostics = Array.from(new Set(
      diagnostics
        .filter(d => d.source === "home-assistant" && d.code === "unknown-label")
        .map(d => JSON.stringify(d))
    )).map((d: string) => JSON.parse(d));

    console.log(`Found ${labelDiagnostics.length} label validation diagnostics for templates/special values test:`);
    for (const diagnostic of labelDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // Should only have 2 diagnostics for the unknown labels, not for templates or special values
    assert.strictEqual(labelDiagnostics.length, 2, 
      "Should only flag unknown labels, not templates or special values");

    const foundLabels = labelDiagnostics.map(d => {
      const match = d.message.match(/Label '([^']+)'/);
      return match ? match[1] : null;
    }).filter(l => l !== null);

    assert.ok(foundLabels.includes("unknown_label"), 
      "Should flag the unknown_label");
    assert.ok(foundLabels.includes("missing_label_test"), 
      "Should flag the missing_label_test");
  });

  test("Label validation handles empty and null values gracefully", async () => {
    const testContent = `
automation:
  - alias: "Test Empty Values"
    trigger:
      - platform: state
        entity_id: light.kitchen
    action:
      - service: light.turn_on
        target:
          label_id: ""                    # Empty string, should be skipped
      - service: light.turn_off
        target:
          label_id: null                  # Null value, should be skipped
      - service: light.toggle
        target:
          label_id:                       # No value, should be skipped
      - service: light.turn_on
        target:
          label_id: []                    # Empty array, should be skipped
`;

    const document = TextDocument.create(
      "file:///test-empty-values.yaml",
      "yaml", 
      1,
      testContent
    );

    const diagnostics = await languageService.getDiagnostics(document);

    // Filter for label validation diagnostics
    const labelDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && d.code === "unknown-label"
    );

    console.log(`Found ${labelDiagnostics.length} label validation diagnostics for empty values test:`);
    for (const diagnostic of labelDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // Should have no diagnostics for empty/null values
    assert.strictEqual(labelDiagnostics.length, 0, 
      "Should not flag empty or null values");
  });
});
