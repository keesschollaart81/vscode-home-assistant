import * as assert from "assert";
import { TextDocument } from "vscode-languageserver-textdocument";
import { CompletionItem, CompletionItemKind, MarkupContent } from "vscode-languageserver-protocol";
import { IHaConnection } from "../../language-service/src/home-assistant/haConnection";
import { HomeAssistantLanguageService } from "../../language-service/src/haLanguageService";
import { getLanguageService } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
import { SchemaServiceForIncludes } from "../../language-service/src/schemas/schemaService";
import { HomeAssistantConfiguration } from "../../language-service/src/haConfig/haConfig";

class MockFileAccessor {
  async getFileContents(_uri: string): Promise<string> {
    return "";
  }
  
  getRelativePath(_fileUri: string, _includePath: string): string {
    return "";
  }
  
  getRelativePathAsFileUri(_fileUri: string, _includePath: string): string {
    return "";
  }
  
  async getFilesInFolderRelativeFromAsFileUri(_folderPath: string, _fileUri: string): Promise<string[]> {
    return [];
  }
}

// Mock Home Assistant connection with predefined floors
class MockHaConnection implements IHaConnection {
  private mockFloorCompletions: CompletionItem[] = [
    {
      label: "ground_floor",
      detail: "Ground Floor",
      kind: CompletionItemKind.Variable,
      data: { isFloor: true },
      documentation: {
        kind: "markdown",
        value: "**ground_floor**\n\nName: Ground Floor\n\n",
      } as MarkupContent,
    },
    {
      label: "first_floor",
      detail: "First Floor",
      kind: CompletionItemKind.Variable,
      data: { isFloor: true },
      documentation: {
        kind: "markdown",
        value: "**first_floor**\n\nName: First Floor\n\n",
      } as MarkupContent,
    },
    {
      label: "basement",
      detail: "Basement",
      kind: CompletionItemKind.Variable,
      data: { isFloor: true },
      documentation: {
        kind: "markdown",
        value: "**basement**\n\nName: Basement\n\n",
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
    return this.mockFloorCompletions; 
  }
  
  async getLabelCompletions(): Promise<CompletionItem[]> { 
    return []; 
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

suite("Floor Validation Tests", () => {
  let languageService: HomeAssistantLanguageService;
  let mockConnection: MockHaConnection;
  
  setup(async () => {
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
      await SchemaServiceForIncludes.create(),
      () => { /* mock sendDiagnostics */ }, 
      () => { /* mock diagnoseAllFiles */ },
      { isConfigured: true, autoRenderTemplates: true } as any // Mock configuration service
    );
  });

  test("Floor validation identifies unknown floors", async () => {
    // Create a test document with both known and unknown floors
    const testContent = `
automation:
  - alias: "Test Floor Validation"
    trigger:
      - platform: state
        entity_id: light.kitchen
    action:
      - service: light.turn_on
        target:
          floor_id: ground_floor          # This exists
      - service: light.turn_off
        target:
          floor_id: non_existing_floor    # This doesn't exist
        
# Test with array syntax
script:
  test_script:
    sequence:
      - service: homeassistant.turn_off
        target:
          floor_id: 
            - basement                   # This exists
            - fake_floor                 # This doesn't exist
          
# Test with inline array
group:
  test_group:
    target:
      floor_id: [first_floor, non_existing]  # One exists, one doesn't
`;

    const document = TextDocument.create(
      "file:///test-floor-validation.yaml",
      "yaml",
      1,
      testContent
    );

    // Get diagnostics from language service (this will call our validation)
    const diagnostics = await languageService.getDiagnostics(document);

    // Filter for floor validation diagnostics
    // We need to deduplicate the results because the test is getting multiple diagnostics for the same issue
    const floorDiagnostics = Array.from(new Set(
      diagnostics
        .filter(d => d.source === "home-assistant" && d.code === "unknown-floor")
        .map(d => JSON.stringify(d))
    )).map((d: string) => JSON.parse(d));

    console.log(`Found ${floorDiagnostics.length} floor validation diagnostics:`);
    for (const diagnostic of floorDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // We should have exactly 3 unknown floor diagnostics
    assert.strictEqual(floorDiagnostics.length, 3, 
      `Expected 3 unknown floor diagnostics, got ${floorDiagnostics.length}`);

    // Check that the diagnostics are for the correct floors
    const expectedUnknownFloors = [
      "non_existing_floor",
      "fake_floor",
      "non_existing"
    ];

    const foundUnknownFloors = floorDiagnostics.map(d => {
      const match = d.message.match(/Floor '([^']+)'/);
      return match ? match[1] : null;
    }).filter(e => e !== null);

    for (const expectedFloor of expectedUnknownFloors) {
      assert.ok(
        foundUnknownFloors.includes(expectedFloor),
        `Expected to find diagnostic for unknown floor '${expectedFloor}'`
      );
    }

    // Verify that known floors don't generate diagnostics
    const knownFloors = ["ground_floor", "first_floor", "basement"];
    for (const knownFloor of knownFloors) {
      assert.ok(
        !foundUnknownFloors.includes(knownFloor),
        `Known floor '${knownFloor}' should not generate a diagnostic`
      );
    }
  });

  test("Floor validation skips templates and special values", async () => {
    const testContent = `
automation:
  - alias: "Test Templates and Special Values"
    trigger:
      - platform: state
        entity_id: light.kitchen
    action:
      - service: light.turn_on
        target:
          floor_id: "{{ states.floor.template }}"   # Template, should be skipped
      - service: light.turn_off
        target:
          floor_id: !secret my_floor_id             # Secret, should be skipped
      - service: light.turn_on
        target:
          floor_id: all                            # Special value, should be skipped
      - service: light.turn_off
        target:
          floor_id: none                           # Special value, should be skipped
      - service: light.toggle
        target:
          floor_id: unknown_floor                   # Unknown floor, should be flagged
`;

    const document = TextDocument.create(
      "file:///test-templates-specials.yaml",
      "yaml", 
      1,
      testContent
    );

    const diagnostics = await languageService.getDiagnostics(document);

    // Filter for floor validation diagnostics and deduplicate
    const floorDiagnostics = Array.from(new Set(
      diagnostics
        .filter(d => d.source === "home-assistant" && d.code === "unknown-floor")
        .map(d => JSON.stringify(d))
    )).map((d: string) => JSON.parse(d));

    console.log(`Found ${floorDiagnostics.length} floor validation diagnostics for templates/special values test:`);
    for (const diagnostic of floorDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // Should only have 1 diagnostic for the unknown floor, not for templates or special values
    assert.strictEqual(floorDiagnostics.length, 1, 
      "Should only flag unknown floors, not templates or special values");

    const foundFloor = floorDiagnostics[0].message.match(/Floor '([^']+)'/)?.[1];
    assert.strictEqual(foundFloor, "unknown_floor", 
      "Should flag the unknown floor");
  });

  test("Floor validation skips commented lines", async () => {
    const testContent = `
# This is a comment with floor_id: commented_floor
automation:
  - alias: "Comment Test"
    trigger:
      - platform: state
        entity_id: sensor.test
    # floor_id: commented_in_middle
    action:
      - service: light.turn_on
        target:
          # This commented line should be ignored: floor_id: commented_floor
          floor_id: ground_floor
      # - service: light.turn_off
      #   target:
      #     floor_id: commented_unknown_floor
`;

    const document = TextDocument.create(
      "file:///test-floor-comments.yaml",
      "yaml",
      1,
      testContent
    );

    const diagnostics = await languageService.getDiagnostics(document);

    // Filter for floor validation diagnostics
    const floorDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && d.code === "unknown-floor"
    );

    console.log(`Found ${floorDiagnostics.length} floor validation diagnostics for comment test:`);
    for (const diagnostic of floorDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // Should have no diagnostics for commented floors
    assert.strictEqual(floorDiagnostics.length, 0, 
      "Should not flag floors in commented lines");
  });
});
