import * as assert from "assert";
import { HomeAssistantLanguageService } from "../../language-service/src/haLanguageService";
import { TextDocument, CompletionItem } from "vscode-languageserver-protocol";
import { IHaConnection } from "../../language-service/src/home-assistant/haConnection";
import { HassEntities } from "home-assistant-js-websocket";
import { HomeAssistantConfiguration } from "../../language-service/src/haConfig/haConfig";
import { getLanguageService } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
import { SchemaServiceForIncludes } from "../../language-service/src/schemas/schemaService";

// Mock file accessor for testing secrets
class MockFileAccessor {
  private secretsContent: string;

  constructor(secretsContent = "") {
    this.secretsContent = secretsContent;
  }

  getFileContents(path: string): string {
    if (path === "secrets.yaml") {
      return this.secretsContent;
    }
    return "";
  }
}

// Mock Home Assistant connection (simplified for secrets testing)
class MockHaConnection implements IHaConnection {
  private mockEntities: HassEntities = {};

  async tryConnect(): Promise<void> {
    // Mock implementation
  }
  
  async notifyConfigUpdate(): Promise<void> {
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
    return []; 
  }
  
  async getHassEntities(): Promise<HassEntities> {
    return this.mockEntities;
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

suite("Secrets Validation Mock Tests", () => {
  let languageService: HomeAssistantLanguageService;
  let mockConnection: MockHaConnection;

  setup(async () => {
    mockConnection = new MockHaConnection();
    
    // Mock secrets.yaml content with some test secrets
    const mockSecretsContent = `
# Test secrets file
database_password: "supersecret123"
api_key: "abc123def456"
wifi_password: "mypassword"
mqtt_user: "homeassistant"
mqtt_password: "mqttpass"
`;

    const fileAccessor = new MockFileAccessor(mockSecretsContent);
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

  test("Secrets validation identifies unknown secrets", async () => {
    // Create a test document with both known and unknown secrets
    const testContent = `
automation:
  - alias: "Test Secrets Validation"
    trigger:
      - platform: state
        entity_id: light.kitchen
    action:
      - service: notify.email
        data:
          message: "Motion detected"
          target: !secret api_key              # This exists
      - service: mqtt.publish
        data:
          topic: "home/status"
          payload: "online"
          username: !secret mqtt_user          # This exists
          password: !secret unknown_secret     # This doesn't exist
          
script:
  test_script:
    sequence:
      - service: shell_command.backup
        data:
          password: !secret database_password  # This exists
      - service: notify.telegram
        data:
          api_key: !secret invalid_key         # This doesn't exist
`;

    const document = TextDocument.create(
      "file:///test-secrets-validation.yaml",
      "yaml",
      1,
      testContent
    );

    // Get diagnostics from language service (this will call our validation)
    const diagnostics = await languageService.getDiagnostics(document);

    // Filter for secrets validation diagnostics
    const secretsDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && d.code === "unknown-secret"
    );

    console.log(`Found ${secretsDiagnostics.length} secrets validation diagnostics:`);
    for (const diagnostic of secretsDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // We should have exactly 2 unknown secret diagnostics
    assert.strictEqual(secretsDiagnostics.length, 2, 
      `Expected 2 unknown secret diagnostics, got ${secretsDiagnostics.length}`);

    // Check that the diagnostics are for the correct secrets
    const expectedUnknownSecrets = [
      "unknown_secret",
      "invalid_key"
    ];

    const foundUnknownSecrets = secretsDiagnostics.map(d => {
      const match = d.message.match(/Secret '([^']+)'/);
      return match ? match[1] : null;
    }).filter(s => s !== null);

    for (const expectedSecret of expectedUnknownSecrets) {
      assert.ok(
        foundUnknownSecrets.includes(expectedSecret),
        `Expected to find diagnostic for unknown secret '${expectedSecret}'`
      );
    }

    // Verify that known secrets don't generate diagnostics
    const knownSecrets = ["api_key", "mqtt_user", "database_password"];
    for (const knownSecret of knownSecrets) {
      assert.ok(
        !foundUnknownSecrets.includes(knownSecret),
        `Known secret '${knownSecret}' should not generate a diagnostic`
      );
    }
  });

  test("Secrets validation skips templates and nested secrets", async () => {
    const testContent = `
automation:
  - alias: "Test Templates and Nested"
    trigger:
      - platform: state
        entity_id: light.kitchen
    action:
      - service: notify.email
        data:
          # Template secret, should be skipped
          api_key: "{{ states('input_text.api_key') }}"
      - service: shell_command.test
        data:
          # Unknown secret, should be flagged
          password: !secret nonexistent_secret
          # Valid secret, should not be flagged  
          user: !secret mqtt_user
`;

    const document = TextDocument.create(
      "file:///test-templates.yaml",
      "yaml", 
      1,
      testContent
    );

    const diagnostics = await languageService.getDiagnostics(document);
    const secretsDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && d.code === "unknown-secret"
    );

    console.log(`Found ${secretsDiagnostics.length} secrets validation diagnostics for templates test:`);
    for (const diagnostic of secretsDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // Should only have 1 diagnostic for the unknown secret, not for templates
    assert.strictEqual(secretsDiagnostics.length, 1, 
      "Should only flag unknown secrets, not templates");

    const foundSecret = secretsDiagnostics[0].message.match(/Secret '([^']+)'/)?.[1];
    assert.strictEqual(foundSecret, "nonexistent_secret", 
      "Should flag the unknown secret");
  });

  test("Secrets validation handles invalid secret names gracefully", async () => {
    const testContent = `
automation:
  - alias: "Test Invalid Secret Names"
    trigger:
      - platform: state
        entity_id: light.kitchen
    action:
      - service: test.service
        data:
          # Invalid secret name format (has spaces, special chars)
          key1: !secret "invalid secret with spaces"
          # Valid format but unknown secret
          key2: !secret valid_but_unknown
          # Valid and known secret
          key3: !secret api_key
`;

    const document = TextDocument.create(
      "file:///test-invalid-names.yaml",
      "yaml",
      1, 
      testContent
    );

    const diagnostics = await languageService.getDiagnostics(document);
    const secretsDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && d.code === "unknown-secret"
    );

    console.log(`Found ${secretsDiagnostics.length} secrets validation diagnostics for invalid names test:`);
    for (const diagnostic of secretsDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // Should only have 1 diagnostic for the valid format unknown secret
    assert.strictEqual(secretsDiagnostics.length, 1,
      "Should only flag valid format unknown secrets");

    const foundSecret = secretsDiagnostics[0].message.match(/Secret '([^']+)'/)?.[1];
    assert.strictEqual(foundSecret, "valid_but_unknown",
      "Should flag the valid but unknown secret");
  });
});
