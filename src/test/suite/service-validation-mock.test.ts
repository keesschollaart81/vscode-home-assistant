import * as assert from "assert";
import { HomeAssistantLanguageService } from "../../language-service/src/haLanguageService";
import { TextDocument, CompletionItem, CompletionItemKind, MarkupContent } from "vscode-languageserver-protocol";
import { IHaConnection } from "../../language-service/src/home-assistant/haConnection";
import { HassServices } from "home-assistant-js-websocket";
import { HomeAssistantConfiguration } from "../../language-service/src/haConfig/haConfig";
import { getLanguageService } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
import { SchemaServiceForIncludes } from "../../language-service/src/schemas/schemaService";

// Mock file accessor for testing
class MockFileAccessor {
  getFileContents(): string {
    return "";
  }
}

// Mock Home Assistant connection with predefined services
class MockHaConnection implements IHaConnection {
  private mockServices: HassServices = {
    light: {
      turn_on: {
        name: "Turn on",
        description: "Turn on one or more lights",
        fields: {},
        target: {}
      },
      turn_off: {
        name: "Turn off", 
        description: "Turn off one or more lights",
        fields: {},
        target: {}
      },
      toggle: {
        name: "Toggle",
        description: "Toggle one or more lights",
        fields: {},
        target: {}
      }
    },
    switch: {
      turn_on: {
        name: "Turn on",
        description: "Turn on switch",
        fields: {},
        target: {}
      },
      turn_off: {
        name: "Turn off",
        description: "Turn off switch", 
        fields: {},
        target: {}
      }
    },
    homeassistant: {
      turn_off: {
        name: "Generic turn off",
        description: "Generic service to turn off devices",
        fields: {},
        target: {}
      },
      restart: {
        name: "Restart",
        description: "Restart Home Assistant",
        fields: {},
        target: {}
      }
    }
  };

  private mockServiceCompletions: CompletionItem[] = [
    {
      label: "light.turn_on",
      detail: "Turn on",
      kind: CompletionItemKind.Function,
      data: { isService: true },
      documentation: {
        kind: "markdown",
        value: "**Turn on**\n\nTurn on one or more lights\n\n",
      } as MarkupContent,
    },
    {
      label: "light.turn_off",
      detail: "Turn off",
      kind: CompletionItemKind.Function,
      data: { isService: true },
      documentation: {
        kind: "markdown",
        value: "**Turn off**\n\nTurn off one or more lights\n\n",
      } as MarkupContent,
    },
    {
      label: "light.toggle",
      detail: "Toggle",
      kind: CompletionItemKind.Function,
      data: { isService: true },
      documentation: {
        kind: "markdown",
        value: "**Toggle**\n\nToggle one or more lights\n\n",
      } as MarkupContent,
    },
    {
      label: "switch.turn_on",
      detail: "Turn on",
      kind: CompletionItemKind.Function,
      data: { isService: true },
      documentation: {
        kind: "markdown",
        value: "**Turn on**\n\nTurn on switch\n\n",
      } as MarkupContent,
    },
    {
      label: "switch.turn_off",
      detail: "Turn off",
      kind: CompletionItemKind.Function,
      data: { isService: true },
      documentation: {
        kind: "markdown",
        value: "**Turn off**\n\nTurn off switch\n\n",
      } as MarkupContent,
    },
    {
      label: "homeassistant.turn_off",
      detail: "Generic turn off",
      kind: CompletionItemKind.Function,
      data: { isService: true },
      documentation: {
        kind: "markdown",
        value: "**Generic turn off**\n\nGeneric service to turn off devices\n\n",
      } as MarkupContent,
    },
    {
      label: "homeassistant.restart",
      detail: "Restart",
      kind: CompletionItemKind.Function,
      data: { isService: true },
      documentation: {
        kind: "markdown",
        value: "**Restart**\n\nRestart Home Assistant\n\n",
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
    return []; 
  }
  
  async getServiceCompletions(): Promise<CompletionItem[]> { 
    return this.mockServiceCompletions; 
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

  async getHassServices(): Promise<HassServices> {
    return this.mockServices;
  }
}

// Test suite for action validation
suite("Action Validation Mock Test", () => {
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

  test("Action validation identifies unknown actions", async () => {
    // Create a test document with both known and unknown services
    const testContent = `
automation:
  - alias: "Test Service Validation"
    trigger:
      - platform: state
        entity_id: light.kitchen
    action:
      - service: light.turn_on             # This exists
        entity_id: light.living_room
      - service: light.non_existing        # This doesn't exist
        entity_id: light.kitchen
        
# Test with action property
script:
  test_script:
    sequence:
      - action: switch.turn_on             # This exists (using action instead of service)
        entity_id: switch.test
      - action: switch.non_existing        # This doesn't exist
        entity_id: switch.test
          
# Test with array syntax
group:
  test_group:
    entities:
      - service: homeassistant.turn_off    # This exists
      - service: unknown.service           # This doesn't exist
`;

    const document = TextDocument.create(
      "file:///test-service-validation.yaml",
      "yaml",
      1,
      testContent
    );

    // Get diagnostics from language service (this will call our validation)
    const diagnostics = await languageService.getDiagnostics(document);

    // Filter for action validation diagnostics
    const actionDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && d.code === "unknown-action"
    );

    console.log(`Found ${actionDiagnostics.length} action validation diagnostics:`);
    for (const diagnostic of actionDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // We should have exactly 2 unknown action diagnostics (not including the one in group: section)
    assert.strictEqual(actionDiagnostics.length, 2, 
      `Expected 2 unknown action diagnostics, got ${actionDiagnostics.length}. ` +
      `The third one (unknown.service) should be ignored because it's not in an automation/script context.`);

    // Check that the diagnostics are for the correct actions
    const expectedUnknownActions = [
      "light.non_existing",
      "switch.non_existing"
      // "unknown.service" is correctly ignored because it's in a group: section
    ];

    const foundUnknownActions = actionDiagnostics.map(d => {
      const match = d.message.match(/Action '([^']+)'/);
      return match ? match[1] : null;
    }).filter(s => s !== null);

    for (const expectedAction of expectedUnknownActions) {
      assert.ok(
        foundUnknownActions.includes(expectedAction),
        `Expected to find diagnostic for unknown action '${expectedAction}'`
      );
    }

    // Verify that known actions don't generate diagnostics
    const knownActions = ["light.turn_on", "switch.turn_on", "homeassistant.turn_off"];
    for (const knownAction of knownActions) {
      assert.ok(
        !foundUnknownActions.includes(knownAction),
        `Known action '${knownAction}' should not generate a diagnostic`
      );
    }
  });

  test("Action validation skips templates and secrets", async () => {
    const testContent = `
automation:
  - alias: "Test Templates and Secrets"
    trigger:
      - platform: state
        entity_id: light.kitchen
    action:
      - service: "{{ states.sensor.template_service.state }}"  # Template, should be skipped
        entity_id: light.test
      - service: !secret my_service                           # Secret, should be skipped
        entity_id: light.test
      - service: light.unknown_service                        # Unknown action, should be flagged
        entity_id: light.test
`;

    const document = TextDocument.create(
      "file:///test-templates-secrets.yaml",
      "yaml", 
      1,
      testContent
    );

    const diagnostics = await languageService.getDiagnostics(document);
    const actionDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && d.code === "unknown-action"
    );

    console.log(`Found ${actionDiagnostics.length} action validation diagnostics for templates/secrets test:`);
    for (const diagnostic of actionDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // Should only have 1 diagnostic for the unknown action, not for templates or secrets
    assert.strictEqual(actionDiagnostics.length, 1, 
      "Should only flag unknown actions, not templates or secrets");

    const foundAction = actionDiagnostics[0].message.match(/Action '([^']+)'/)?.[1];
    assert.strictEqual(foundAction, "light.unknown_service", 
      "Should flag the unknown action");
  });

  test("Action validation handles malformed action IDs gracefully", async () => {
    const testContent = `
automation:
  - alias: "Test Malformed Actions"
    trigger:
      - platform: state
        entity_id: light.kitchen
    action:
      - service: not_a_valid_service_format        # Invalid format, should be skipped
        entity_id: light.test
      - action: "just_a_string"                    # Invalid format, should be skipped
        entity_id: light.test
      - service: light.valid_but_unknown           # Valid format but unknown, should be flagged
        entity_id: light.test
`;

    const document = TextDocument.create(
      "file:///test-malformed.yaml",
      "yaml",
      1, 
      testContent
    );

    const diagnostics = await languageService.getDiagnostics(document);
    const actionDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && d.code === "unknown-action"
    );

    console.log(`Found ${actionDiagnostics.length} action validation diagnostics for malformed test:`);
    for (const diagnostic of actionDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // Should only have 1 diagnostic for the valid but unknown action
    assert.strictEqual(actionDiagnostics.length, 1,
      "Should only flag valid format unknown actions");

    const foundAction = actionDiagnostics[0].message.match(/Action '([^']+)'/)?.[1];
    assert.strictEqual(foundAction, "light.valid_but_unknown",
      "Should flag the valid but unknown action");
  });

  test("Action validation skips commented lines", async () => {
    const testContent = `
# This is a comment with service: commented_service
automation:
  - alias: "Comment Test"
    trigger:
      - platform: state
        entity_id: sensor.test
    # service: commented_in_middle
    action:
      - service: light.turn_on
        # This commented line should be ignored: service: commented_action
        target:
          entity_id: light.test
      # - service: switch.commented_unknown_action
      #   target:
      #     entity_id: switch.test
`;

    const document = TextDocument.create(
      "file:///test-action-comments.yaml",
      "yaml",
      1,
      testContent
    );

    const diagnostics = await languageService.getDiagnostics(document);

    // Filter for action validation diagnostics
    const actionDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && d.code === "unknown-action"
    );

    console.log(`Found ${actionDiagnostics.length} action validation diagnostics for comment test:`);
    for (const diagnostic of actionDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // Should have no diagnostics for commented actions
    assert.strictEqual(actionDiagnostics.length, 0, 
      "Should not flag actions in commented lines");
  });
});
