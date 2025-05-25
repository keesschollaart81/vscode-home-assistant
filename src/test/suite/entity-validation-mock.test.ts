import * as assert from "assert";
import { HomeAssistantLanguageService } from "../../language-service/src/haLanguageService";
import { TextDocument, CompletionItem } from "vscode-languageserver-protocol";
import { IHaConnection } from "../../language-service/src/home-assistant/haConnection";
import { HassEntities } from "home-assistant-js-websocket";
import { HomeAssistantConfiguration } from "../../language-service/src/haConfig/haConfig";
import { getLanguageService } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
import { SchemaServiceForIncludes } from "../../language-service/src/schemas/schemaService";

// Mock file accessor for testing
class MockFileAccessor {
  getFileContents(): string {
    return "";
  }
}

// Mock Home Assistant connection with predefined entities
class MockHaConnection implements IHaConnection {
  private mockEntities: HassEntities = {
    "light.kitchen": {
      entity_id: "light.kitchen",
      state: "off",
      attributes: {
        friendly_name: "Kitchen Light"
      },
      last_changed: "2023-01-01T00:00:00.000Z",
      last_updated: "2023-01-01T00:00:00.000Z",
      context: {
        id: "test",
        parent_id: null,
        user_id: null
      }
    },
    "light.living_room": {
      entity_id: "light.living_room",
      state: "on",
      attributes: {
        friendly_name: "Living Room Light"
      },
      last_changed: "2023-01-01T00:00:00.000Z",
      last_updated: "2023-01-01T00:00:00.000Z",
      context: {
        id: "test",
        parent_id: null,
        user_id: null
      }
    },
    "binary_sensor.motion": {
      entity_id: "binary_sensor.motion",
      state: "off",
      attributes: {
        friendly_name: "Motion Sensor"
      },
      last_changed: "2023-01-01T00:00:00.000Z",
      last_updated: "2023-01-01T00:00:00.000Z",
      context: {
        id: "test",
        parent_id: null,
        user_id: null
      }
    }
  };

  async tryConnect(): Promise<void> {
    // Mock implementation
  }
  
  async notifyConfigUpdate(): Promise<void> {
    // Mock implementation
  }
  
  async getAreaCompletions(): Promise<CompletionItem[]> { 
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
    return []; 
  }
  
  async getServiceCompletions(): Promise<CompletionItem[]> { 
    return []; 
  }
  
  async getHassEntities(): Promise<HassEntities> {
    return this.mockEntities;
  }
}

suite("Entity Validation with Mock Data", () => {
  let languageService: HomeAssistantLanguageService;
  let mockConnection: MockHaConnection;

  suiteSetup(() => {
    // Set up mock services
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

  test("Entity validation identifies unknown entities", async () => {
    // Create a test document with both known and unknown entities
    const testContent = `
automation:
  - alias: "Test Entity Validation"
    trigger:
      - platform: state
        entity_id: light.kitchen              # This exists
    condition:
      - condition: state
        entity_id: light.non_existing         # This doesn't exist
    action:
      - service: light.turn_on
        entity_id: light.living_room          # This exists
      - service: light.turn_off
        entity_id: sensor.non_existing        # This doesn't exist
        
# Test with array syntax
script:
  test_script:
    sequence:
      - service: homeassistant.turn_off
        entity_id: 
          - light.kitchen                     # This exists
          - light.fake_entity                 # This doesn't exist
          
# Test with inline array
group:
  test_group:
    entities: [light.living_room, switch.non_existing]  # One exists, one doesn't
`;

    const document = TextDocument.create(
      "file:///test-entity-validation.yaml",
      "yaml",
      1,
      testContent
    );

    // Get diagnostics from language service (this will call our validation)
    const diagnostics = await languageService.getDiagnostics(document);

    // Filter for entity validation diagnostics
    const entityDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && d.code === "unknown-entity"
    );

    console.log(`Found ${entityDiagnostics.length} entity validation diagnostics:`);
    for (const diagnostic of entityDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // We should have exactly 4 unknown entity diagnostics
    assert.strictEqual(entityDiagnostics.length, 4, 
      `Expected 4 unknown entity diagnostics, got ${entityDiagnostics.length}`);

    // Check that the diagnostics are for the correct entities
    const expectedUnknownEntities = [
      "light.non_existing",
      "sensor.non_existing", 
      "light.fake_entity",
      "switch.non_existing"
    ];

    const foundUnknownEntities = entityDiagnostics.map(d => {
      const match = d.message.match(/Entity '([^']+)'/);
      return match ? match[1] : null;
    }).filter(e => e !== null);

    for (const expectedEntity of expectedUnknownEntities) {
      assert.ok(
        foundUnknownEntities.includes(expectedEntity),
        `Expected to find diagnostic for unknown entity '${expectedEntity}'`
      );
    }

    // Verify that known entities don't generate diagnostics
    const knownEntities = ["light.kitchen", "light.living_room", "binary_sensor.motion"];
    for (const knownEntity of knownEntities) {
      assert.ok(
        !foundUnknownEntities.includes(knownEntity),
        `Known entity '${knownEntity}' should not generate a diagnostic`
      );
    }
  });

  test("Entity validation skips templates and secrets", async () => {
    const testContent = `
automation:
  - alias: "Test Templates and Secrets"
    trigger:
      - platform: state
        entity_id: "{{ states.sensor.template_entity.entity_id }}"  # Template, should be skipped
    condition:
      - condition: state
        entity_id: !secret my_entity_id                             # Secret, should be skipped
    action:
      - service: light.turn_on
        entity_id: light.unknown_entity                             # Unknown entity, should be flagged
`;

    const document = TextDocument.create(
      "file:///test-templates-secrets.yaml",
      "yaml", 
      1,
      testContent
    );

    const diagnostics = await languageService.getDiagnostics(document);
    const entityDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && d.code === "unknown-entity"
    );

    console.log(`Found ${entityDiagnostics.length} entity validation diagnostics for templates/secrets test:`);
    for (const diagnostic of entityDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // Should only have 1 diagnostic for the unknown entity, not for templates or secrets
    assert.strictEqual(entityDiagnostics.length, 1, 
      "Should only flag unknown entities, not templates or secrets");

    const foundEntity = entityDiagnostics[0].message.match(/Entity '([^']+)'/)?.[1];
    assert.strictEqual(foundEntity, "light.unknown_entity", 
      "Should flag the unknown entity");
  });

  test("Entity validation handles malformed entity IDs gracefully", async () => {
    const testContent = `
automation:
  - alias: "Test Malformed Entities"
    trigger:
      - platform: state
        entity_id: not_a_valid_entity_format        # Invalid format, should be skipped
    action:
      - service: light.turn_on
        entity_id: "just_a_string"                  # Invalid format, should be skipped
      - service: light.turn_off
        entity_id: light.valid_but_unknown          # Valid format but unknown, should be flagged
`;

    const document = TextDocument.create(
      "file:///test-malformed.yaml",
      "yaml",
      1, 
      testContent
    );

    const diagnostics = await languageService.getDiagnostics(document);
    const entityDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && d.code === "unknown-entity"
    );

    console.log(`Found ${entityDiagnostics.length} entity validation diagnostics for malformed test:`);
    for (const diagnostic of entityDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // Should only have 1 diagnostic for the valid but unknown entity
    assert.strictEqual(entityDiagnostics.length, 1,
      "Should only flag valid format unknown entities");

    const foundEntity = entityDiagnostics[0].message.match(/Entity '([^']+)'/)?.[1];
    assert.strictEqual(foundEntity, "light.valid_but_unknown",
      "Should flag the valid but unknown entity");
  });
});
