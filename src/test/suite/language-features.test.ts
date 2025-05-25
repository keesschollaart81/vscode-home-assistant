import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";

// Tests for Home Assistant language features
suite("Home Assistant Language Features", () => {
  let workspacePath: string;
  
  suiteSetup(async () => {
    workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";
    vscode.window.showInformationMessage("Starting Home Assistant language feature tests...");
  });
  
  test("Configuration file is recognized as Home Assistant", async () => {
    // Open the configuration file
    const configPath = path.join(workspacePath, "configuration.yaml");
    const document = await vscode.workspace.openTextDocument(configPath);
    await vscode.window.showTextDocument(document);
    
    // Wait for language server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify the language ID is correctly set
    assert.ok(
      document.languageId === "yaml" || document.languageId === "home-assistant", 
      `Document has expected language ID (got: ${document.languageId})`
    );
    
    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
  
  test("Configuration file includes are processed", async () => {
    // Open the configuration file
    const configPath = path.join(workspacePath, "configuration.yaml");
    const document = await vscode.workspace.openTextDocument(configPath);
    const content = document.getText();
    
    // Verify configuration has include directives
    assert.ok(content.includes("include:"), "Configuration contains include section");
    assert.ok(content.includes("test-position-tracking.yaml"), "Configuration includes test-position-tracking.yaml");
    assert.ok(content.includes("test-goto-definition.yaml"), "Configuration includes test-goto-definition.yaml");
  });
});
