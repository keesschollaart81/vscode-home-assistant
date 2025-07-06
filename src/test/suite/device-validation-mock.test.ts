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

// Mock Home Assistant connection with predefined devices
class MockHaConnection implements IHaConnection {
  private mockDeviceCompletions: CompletionItem[] = [
    {
      label: "device_1234",
      detail: "Smart Light Device",
      kind: CompletionItemKind.Variable,
      data: { isDevice: true },
      documentation: {
        kind: "markdown",
        value: "**device_1234**\n\nName: Smart Light Device\n\nManufacturer: Philips\n\nModel: Hue Bulb\n\nArea: living_room\n\n",
      } as MarkupContent,
    },
    {
      label: "device_5678",
      detail: "Motion Sensor",
      kind: CompletionItemKind.Variable,
      data: { isDevice: true },
      documentation: {
        kind: "markdown",
        value: "**device_5678**\n\nName: Motion Sensor\n\nManufacturer: Aqara\n\nModel: RTCGQ11LM\n\nArea: kitchen\n\n",
      } as MarkupContent,
    },
    {
      label: "device_9999",
      detail: "Smart Thermostat",
      kind: CompletionItemKind.Variable,
      data: { isDevice: true },
      documentation: {
        kind: "markdown",
        value: "**device_9999**\n\nName: Smart Thermostat\n\nManufacturer: Nest\n\nModel: Learning Thermostat\n\nArea: bedroom\n\n",
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
    return this.mockDeviceCompletions; 
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

suite("Device Validation Tests", () => {
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
      () => { /* mock diagnoseAllFiles */ },
      { isConfigured: true, autoRenderTemplates: true } as any // Mock configuration service
    );
  });

  test("Should detect unknown device_id", async () => {
    const content = `
automation:
  - alias: "Test Automation"
    trigger:
      platform: device
      device_id: unknown_device
    action:
      service: light.turn_on
`;

    const document = TextDocument.create("file://test.yaml", "yaml", 1, content);
    const diagnostics = await languageService.getDiagnostics(document);
    
    const deviceDiagnostics = diagnostics.filter(d => d.code === "unknown-device");
    assert.strictEqual(deviceDiagnostics.length, 1);
    assert.strictEqual(deviceDiagnostics[0].message, "Device 'unknown_device' does not exist in your Home Assistant instance");
    assert.strictEqual(deviceDiagnostics[0].severity, 2); // Warning
  });

  test("Should not warn for valid device_id", async () => {
    const content = `
automation:
  - alias: "Test Automation"
    trigger:
      platform: device
      device_id: device_1234
    action:
      service: light.turn_on
`;

    const document = TextDocument.create("file://test.yaml", "yaml", 1, content);
    const diagnostics = await languageService.getDiagnostics(document);
    
    const deviceDiagnostics = diagnostics.filter(d => d.code === "unknown-device");
    assert.strictEqual(deviceDiagnostics.length, 0);
  });

  test("Should detect unknown device in array", async () => {
    const content = `
automation:
  - alias: "Test Automation"
    trigger:
      platform: device
      device_id: [device_1234, unknown_device, device_5678]
    action:
      service: light.turn_on
`;

    const document = TextDocument.create("file://test.yaml", "yaml", 1, content);
    const diagnostics = await languageService.getDiagnostics(document);
    
    const deviceDiagnostics = diagnostics.filter(d => d.code === "unknown-device");
    assert.strictEqual(deviceDiagnostics.length, 1);
    assert.strictEqual(deviceDiagnostics[0].message, "Device 'unknown_device' does not exist in your Home Assistant instance");
  });

  test("Should detect unknown device in multi-line array", async () => {
    const content = `
automation:
  - alias: "Test Automation"
    trigger:
      platform: device
      device_id:
        - device_1234
        - unknown_device
        - device_5678
    action:
      service: light.turn_on
`;

    const document = TextDocument.create("file://test.yaml", "yaml", 1, content);
    const diagnostics = await languageService.getDiagnostics(document);
    
    const deviceDiagnostics = diagnostics.filter(d => d.code === "unknown-device");
    assert.strictEqual(deviceDiagnostics.length, 1);
    assert.strictEqual(deviceDiagnostics[0].message, "Device 'unknown_device' does not exist in your Home Assistant instance");
  });

  test("Should skip template devices", async () => {
    const content = `
automation:
  - alias: "Test Automation"
    trigger:
      platform: device
      device_id: "{{ states('input_select.device_selector') }}"
    action:
      service: light.turn_on
`;

    const document = TextDocument.create("file://test.yaml", "yaml", 1, content);
    const diagnostics = await languageService.getDiagnostics(document);
    
    const deviceDiagnostics = diagnostics.filter(d => d.code === "unknown-device");
    assert.strictEqual(deviceDiagnostics.length, 0);
  });

  test("Should skip special values", async () => {
    const content = `
automation:
  - alias: "Test Automation"
    trigger:
      platform: device
      device_id: none
    action:
      service: light.turn_on
`;

    const document = TextDocument.create("file://test.yaml", "yaml", 1, content);
    const diagnostics = await languageService.getDiagnostics(document);
    
    const deviceDiagnostics = diagnostics.filter(d => d.code === "unknown-device");
    assert.strictEqual(deviceDiagnostics.length, 0);
  });

  test("Should work with device property variant", async () => {
    const content = `
automation:
  - alias: "Test Automation"
    trigger:
      platform: device
      device: unknown_device_alt
    action:
      service: light.turn_on
`;

    const document = TextDocument.create("file://test.yaml", "yaml", 1, content);
    const diagnostics = await languageService.getDiagnostics(document);
    
    const deviceDiagnostics = diagnostics.filter(d => d.code === "unknown-device");
    assert.strictEqual(deviceDiagnostics.length, 1);
    assert.strictEqual(deviceDiagnostics[0].message, "Device 'unknown_device_alt' does not exist in your Home Assistant instance");
  });

  test("Device validation skips commented lines", async () => {
    const content = `
# This is a comment with device_id: commented_device
automation:
  - alias: "Comment Test"
    trigger:
      platform: state
      entity_id: sensor.test
    # device_id: commented_in_middle
    action:
      - service: light.turn_on
        target:
          # This commented line should be ignored: device_id: commented_device
          device_id: device_1234
      # - service: light.turn_off
      #   target:
      #     device_id: commented_unknown_device
`;

    const document = TextDocument.create("file://test.yaml", "yaml", 1, content);
    const diagnostics = await languageService.getDiagnostics(document);
    
    // Filter for device validation diagnostics
    const deviceDiagnostics = diagnostics.filter(d => d.code === "unknown-device");

    console.log(`Found ${deviceDiagnostics.length} device validation diagnostics for comment test:`);
    for (const diagnostic of deviceDiagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
    }

    // Should have no diagnostics for commented devices
    assert.strictEqual(deviceDiagnostics.length, 0, 
      "Should not flag devices in commented lines");
  });
});
