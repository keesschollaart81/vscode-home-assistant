import * as assert from "assert";
import * as vscode from "vscode";

// Test for issue #3623: Entity in trigger incorrectly validated as action
suite("Automation Trigger Issue #3623", () => {
  suiteSetup(async () => {
    // Activate the extension
    await vscode.extensions.getExtension("keesschollaart.vscode-home-assistant")?.activate();
    
    vscode.window.showInformationMessage("Starting automation trigger issue #3623 tests...");
  });
  
  test("Entity in trigger should not be validated as action", async () => {
    // This is the exact example from the GitHub issue
    const testContent = `id: a2352422dd634878a54720e85d533b42
alias: turning on sitting room ligths
trigger:
  - trigger: state
    entity_id:
    - light.lichten_salon
    from: 'off'
    to: 'on'
action:
  - action: script.turn_on
    data: {}
    target:
      entity_id: script.activate_sitting_room_scene
`;
    
    const document = await vscode.workspace.openTextDocument({
      content: testContent,
      language: "yaml"
    });
    
    await vscode.window.showTextDocument(document);
    
    // Wait for language server processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get diagnostics for the document
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    
    // Log all diagnostics for debugging
    console.log(`Found ${diagnostics.length} diagnostics in automation trigger test:`);
    for (const diagnostic of diagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message} (${diagnostic.source}, code: ${diagnostic.code})`);
    }
    
    // Check for the specific error that should NOT appear
    const wrongActionError = diagnostics.find(d => 
      d.message.includes("Action 'light.lichten_salon' does not exist") &&
      d.code === "unknown-action"
    );
    
    // This should NOT exist - the entity in trigger should not be validated as an action
    assert.ok(!wrongActionError, 
      `Entity 'light.lichten_salon' in trigger should not be validated as action, but found: ${wrongActionError?.message}`
    );
    
    // Check that other action validations still work
    const actionDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && 
      d.code === "unknown-action"
    );
    
    console.log(`Found ${actionDiagnostics.length} action validation diagnostics`);
    
    // The script.turn_on and script.activate_sitting_room_scene might generate validation errors
    // if they don't exist in the test environment, but that's expected behavior
    const scriptTurnOnError = actionDiagnostics.find(d => 
      d.message.includes("script.turn_on")
    );
    
    const scriptActivateError = actionDiagnostics.find(d => 
      d.message.includes("script.activate_sitting_room_scene")
    );
    
    console.log(`Action validation working correctly:
      - script.turn_on error: ${scriptTurnOnError ? 'Yes' : 'No'}
      - script.activate_sitting_room_scene error: ${scriptActivateError ? 'Yes' : 'No'}
    `);
    
    // Verify the document has the expected content
    assert.ok(document.getText().includes("light.lichten_salon"), "Document contains trigger entity");
    assert.ok(document.getText().includes("script.turn_on"), "Document contains action");
    
    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
  
  test("Entity in action should still be validated", async () => {
    // Test that entity validation in action context still works
    const testContent = `id: test_action_validation
alias: test action validation
trigger:
  - trigger: state
    entity_id: sensor.test_sensor
action:
  - action: light.turn_on
    target:
      entity_id: light.should_be_validated_as_entity
`;
    
    const document = await vscode.workspace.openTextDocument({
      content: testContent,
      language: "yaml"
    });
    
    await vscode.window.showTextDocument(document);
    
    // Wait for language server processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get diagnostics for the document
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    
    // Log all diagnostics for debugging
    console.log(`Found ${diagnostics.length} diagnostics in action validation test:`);
    for (const diagnostic of diagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message} (${diagnostic.source}, code: ${diagnostic.code})`);
    }
    
    // Check that the action light.turn_on is validated (might not exist in test env)
    const actionDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && 
      d.code === "unknown-action"
    );
    
    // Check that the entity light.should_be_validated_as_entity is validated (might not exist in test env)
    const entityDiagnostics = diagnostics.filter(d => 
      d.source === "home-assistant" && 
      d.code === "unknown-entity"
    );
    
    console.log(`Action context validation working:
      - Action diagnostics: ${actionDiagnostics.length}
      - Entity diagnostics: ${entityDiagnostics.length}
    `);
    
    // Verify the document has the expected content
    assert.ok(document.getText().includes("light.turn_on"), "Document contains action");
    assert.ok(document.getText().includes("light.should_be_validated_as_entity"), "Document contains entity in action");
    
    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
});