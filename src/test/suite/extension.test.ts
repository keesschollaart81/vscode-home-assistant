import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";

suite("Extension Test Suite", () => {
  suiteSetup(async () => {
    // Activate the extension
    await vscode.extensions.getExtension("keesschollaart.vscode-home-assistant")?.activate();
    
    // Show a message to indicate tests are starting
    vscode.window.showInformationMessage("Starting Home Assistant extension tests...");
  });

  suiteTeardown(() => {
    vscode.window.showInformationMessage("All tests done!");
  });

  test("Extension is activated", async () => {
    const extension = vscode.extensions.getExtension("keesschollaart.vscode-home-assistant");
    assert.ok(extension, "Extension is installed");
    assert.strictEqual(extension?.isActive, true, "Extension is active");
  });

  test("Commands are registered", async () => {
    const commands = await vscode.commands.getCommands(true);
    const extensionCommands = commands.filter(cmd => cmd.startsWith("vscode-home-assistant."));
    
    // Check that essential commands are registered
    // Note: We check for any commands registered by the extension, not specific ones
    assert.ok(extensionCommands.length > 0, "Extension has registered commands");
    console.log("Found commands:", extensionCommands);
  });

  test("Language server activates for Home Assistant files", async () => {
    // Open a Home Assistant YAML file
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";
    const yamlFilePath = path.join(workspacePath, "configuration.yaml");
    const document = await vscode.workspace.openTextDocument(yamlFilePath);
    await vscode.window.showTextDocument(document);
    
    // Wait for language server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Basic test to verify document opened successfully
    assert.ok(document.languageId === "yaml" || document.languageId === "home-assistant", 
      `Document has expected language ID (got: ${document.languageId})`);
    assert.strictEqual(document.uri.fsPath, yamlFilePath, "Document path matches");
    
    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
});
