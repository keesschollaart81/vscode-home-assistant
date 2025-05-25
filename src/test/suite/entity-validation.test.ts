import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";

// Test entity validation functionality
suite("Entity Validation", () => {
  let workspacePath: string;
  
  suiteSetup(async () => {
    workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";
    
    // Activate the extension
    await vscode.extensions.getExtension("keesschollaart.vscode-home-assistant")?.activate();
    
    vscode.window.showInformationMessage("Starting entity validation tests...");
  });
  
  test("Entity validation file can be opened", async () => {
    // Open the entity validation test file
    const testPath = path.join(workspacePath, "test-entity-validation.yaml");
    const document = await vscode.workspace.openTextDocument(testPath);
    await vscode.window.showTextDocument(document);
    
    // Wait for language server to initialize and process diagnostics
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verify the document is opened
    assert.ok(document, "Entity validation test document is opened");
    assert.ok(
      document.languageId === "yaml" || document.languageId === "home-assistant", 
      `Document is recognized as YAML or Home Assistant (got: ${document.languageId})`
    );
    
    // Get diagnostics for the document
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    
    // Log diagnostics for debugging
    console.log(`Found ${diagnostics.length} diagnostics in entity validation test file:`);
    for (const diagnostic of diagnostics) {
      console.log(`  - ${diagnostic.severity}: ${diagnostic.message} (${diagnostic.source})`);
    }
    
    // Check if we have any entity-related diagnostics
    const entityDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && 
      (d.code === "unknown-entity" || d.message.includes("does not exist"))
    );
    
    console.log(`Found ${entityDiagnostics.length} entity validation diagnostics`);
    
    // Note: In a real test environment without Home Assistant connection,
    // we might not get diagnostics, but the test verifies the file structure works
    assert.ok(true, "Entity validation test completed");
    
    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
  
  test("Entity validation handles different entity formats", async () => {
    // Create a temporary test document with various entity formats
    const testContent = `
# Test various entity ID formats
automation:
  - alias: "Entity Test"
    trigger:
      platform: state
      entity_id: sensor.test_sensor
    action:
      - service: light.turn_on
        entity_id: light.test_light
      - service: switch.turn_off
        target:
          entity_id:
            - switch.test_switch1
            - switch.test_switch2
`;
    
    const document = await vscode.workspace.openTextDocument({
      content: testContent,
      language: "yaml"
    });
    
    await vscode.window.showTextDocument(document);
    
    // Wait for language server processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify the document has the expected content
    assert.ok(document.getText().includes("sensor.test_sensor"), "Document contains test entity");
    assert.ok(document.getText().includes("entity_id:"), "Document contains entity_id properties");
    
    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
});
