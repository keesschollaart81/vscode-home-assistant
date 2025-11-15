import * as assert from "assert";
import * as vscode from "vscode";

// Test for issue #2786: Condition selector causes syntax check false error
suite("Condition Selector Issue #2786", () => {
  suiteSetup(async () => {
    // Activate the extension
    await vscode.extensions.getExtension("keesschollaart.vscode-home-assistant")?.activate();

    vscode.window.showInformationMessage("Starting condition selector issue #2786 tests...");
  });

  test("!input as single condition should not produce schema errors", async () => {
    // Test that !input works fine when it's the only condition
    const testContent = `blueprint:
  name: Test Blueprint with Single Condition
  domain: automation
  input:
    my_condition:
      name: My Condition
      selector:
        condition:

use_blueprint:
  path: test.yaml
  input:
    my_condition: []

automation:
  - id: test_single_input_condition
    alias: Test Single Input Condition
    trigger:
      - platform: state
        entity_id: sensor.test
    condition: !input my_condition
    action:
      - service: light.turn_on
        target:
          entity_id: light.test
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
    console.log(`Found ${diagnostics.length} diagnostics in single !input condition test:`);
    for (const diagnostic of diagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message} (${diagnostic.source}, severity: ${diagnostic.severity})`);
    }

    // Check for schema errors related to !input
    const inputSchemaErrors = diagnostics.filter(d =>
      (d.source === "yaml-schema" || d.message.toLowerCase().includes("schema")) &&
      d.message.toLowerCase().includes("input")
    );

    // This should NOT produce schema errors
    assert.strictEqual(inputSchemaErrors.length, 0,
      `Single !input condition should not produce schema errors, but found: ${inputSchemaErrors.map(e => e.message).join(", ")}`
    );

    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("!input mixed with other conditions should not produce schema errors", async () => {
    // This is the core issue from #2786: !input combined with other conditions
    const testContent = `blueprint:
  name: Test Blueprint with Mixed Conditions
  domain: automation
  input:
    my_condition:
      name: My Condition
      selector:
        condition:

use_blueprint:
  path: test.yaml
  input:
    my_condition: []

automation:
  - id: test_mixed_conditions
    alias: Test Mixed Conditions
    trigger:
      - platform: state
        entity_id: sensor.test
    condition:
      - condition: state
        entity_id: input_boolean.test_mode
        state: "on"
      - !input my_condition
      - condition: time
        after: "08:00:00"
        before: "22:00:00"
    action:
      - service: light.turn_on
        target:
          entity_id: light.test
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
    console.log(`Found ${diagnostics.length} diagnostics in mixed conditions test:`);
    for (const diagnostic of diagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message} (${diagnostic.source}, severity: ${diagnostic.severity})`);
    }

    // Check for schema errors related to the conditions array
    const conditionSchemaErrors = diagnostics.filter(d =>
      (d.source === "yaml-schema" || d.message.toLowerCase().includes("schema")) &&
      (d.message.toLowerCase().includes("condition") || d.message.toLowerCase().includes("input"))
    );

    // This should NOT produce schema errors - this is the main fix for issue #2786
    assert.strictEqual(conditionSchemaErrors.length, 0,
      `Mixed !input and regular conditions should not produce schema errors, but found: ${conditionSchemaErrors.map(e => e.message).join(", ")}`
    );

    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("!input in if/then action should not produce schema errors", async () => {
    // Test for the comment from tomlut about if/then actions
    const testContent = `blueprint:
  name: Test Blueprint with If Action
  domain: automation
  input:
    my_condition:
      name: My Condition
      selector:
        condition:

use_blueprint:
  path: test.yaml
  input:
    my_condition: []

automation:
  - id: test_if_then_input
    alias: Test If/Then with Input
    trigger:
      - platform: state
        entity_id: sensor.test
    action:
      - if:
          - condition: state
            entity_id: input_boolean.test_mode
            state: "on"
          - !input my_condition
        then:
          - service: light.turn_on
            target:
              entity_id: light.test
        else:
          - service: light.turn_off
            target:
              entity_id: light.test
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
    console.log(`Found ${diagnostics.length} diagnostics in if/then !input test:`);
    for (const diagnostic of diagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message} (${diagnostic.source}, severity: ${diagnostic.severity})`);
    }

    // Check for schema errors related to the if conditions
    const ifSchemaErrors = diagnostics.filter(d =>
      (d.source === "yaml-schema" || d.message.toLowerCase().includes("schema")) &&
      d.range.start.line >= 15 && d.range.start.line <= 20 // Lines around the 'if' block
    );

    // This should NOT produce schema errors - addresses tomlut's comment
    assert.strictEqual(ifSchemaErrors.length, 0,
      `!input in if/then action should not produce schema errors, but found: ${ifSchemaErrors.map(e => e.message).join(", ")}`
    );

    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("Multiple !input in conditions array should work", async () => {
    // Edge case: multiple !input tags in the same conditions array
    const testContent = `blueprint:
  name: Test Blueprint with Multiple Inputs
  domain: automation
  input:
    condition_1:
      name: Condition 1
      selector:
        condition:
    condition_2:
      name: Condition 2
      selector:
        condition:

use_blueprint:
  path: test.yaml
  input:
    condition_1: []
    condition_2: []

automation:
  - id: test_multiple_inputs
    alias: Test Multiple Inputs
    trigger:
      - platform: state
        entity_id: sensor.test
    condition:
      - !input condition_1
      - condition: state
        entity_id: input_boolean.test_mode
        state: "on"
      - !input condition_2
    action:
      - service: light.turn_on
        target:
          entity_id: light.test
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
    console.log(`Found ${diagnostics.length} diagnostics in multiple !input test:`);
    for (const diagnostic of diagnostics) {
      console.log(`  - Line ${diagnostic.range.start.line + 1}: ${diagnostic.message} (${diagnostic.source}, severity: ${diagnostic.severity})`);
    }

    // Check for schema errors
    const schemaErrors = diagnostics.filter(d =>
      d.source === "yaml-schema" || d.message.toLowerCase().includes("schema")
    );

    // This should NOT produce schema errors
    assert.strictEqual(schemaErrors.length, 0,
      `Multiple !input in conditions should not produce schema errors, but found: ${schemaErrors.map(e => e.message).join(", ")}`
    );

    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
});
