import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";

// Tests for goto definition functionality with script references
suite("Script Reference Tests", () => {
  let workspacePath: string;
  
  suiteSetup(() => {
    workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";
    vscode.window.showInformationMessage("Starting script reference tests...");
  });
  
  test("Validate test files exist", async () => {
    // Verify the test files exist
    const positionTrackingPath = path.join(workspacePath, "test-position-tracking.yaml");
    const gotoDefinitionPath = path.join(workspacePath, "test-goto-definition.yaml");
    
    assert.ok(await fs.access(positionTrackingPath).then(()=>true,()=>false), "Position tracking test file exists");
    assert.ok(await fs.access(gotoDefinitionPath).then(()=>true,()=>false), "Goto definition test file exists");
  });

  test("Script references in automations", async () => {
    // Open the file that references scripts
    const gotoDefinitionPath = path.join(workspacePath, "test-goto-definition.yaml");
    const document = await vscode.workspace.openTextDocument(gotoDefinitionPath);
    await vscode.window.showTextDocument(document);
    
    // Wait for language server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify the file content contains script references
    const content = document.getText();
    assert.ok(content.includes("script.test_script_1"), "Contains reference to test_script_1");
    assert.ok(content.includes("script.test_script_2"), "Contains reference to test_script_2");
    assert.ok(content.includes("script.another_script"), "Contains reference to another_script");
    
    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
});
