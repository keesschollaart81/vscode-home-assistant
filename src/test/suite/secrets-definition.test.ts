import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";

// Tests for goto definition functionality with secrets
suite("Secrets Definition Tests", () => {
  let workspacePath: string;
  
  suiteSetup(() => {
    workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";
    vscode.window.showInformationMessage("Starting secrets definition tests...");
  });
  
  // Helper function to get definitions at a specific position in a document
  async function getDefinitionsAt(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location[] | undefined> {
    return await vscode.commands.executeCommand<vscode.Location[]>(
      "vscode.executeDefinitionProvider",
      document.uri,
      position
    );
  }
  
  // Create or update a test file with secrets references
  async function createTestFile(content: string, fileName: string): Promise<vscode.TextDocument> {
    const testFilePath = path.join(workspacePath, fileName);
    await fs.writeFile(testFilePath, content);
    const document = await vscode.workspace.openTextDocument(testFilePath);
    await vscode.window.showTextDocument(document);
    return document;
  }
  
  test("Validate test files exist", async () => {
    // Verify the test files exist
    const secretsPath = path.join(workspacePath, "secrets.yaml");
    const secretsValidationPath = path.join(workspacePath, "test-secrets-validation.yaml");
    
    assert.ok(await fs.access(secretsPath).then(()=>true,()=>false), "secrets.yaml test file exists");
    assert.ok(await fs.access(secretsValidationPath).then(()=>true,()=>false), "test-secrets-validation.yaml test file exists");
  });

  test("Secrets file content validation", async () => {
    // Open the secrets file to verify it has test secrets
    const secretsPath = path.join(workspacePath, "secrets.yaml");
    const document = await vscode.workspace.openTextDocument(secretsPath);
    const content = document.getText();
    
    // Verify the secrets file contains expected test secrets
    assert.ok(content.includes("database_password:"), "secrets.yaml contains 'database_password' secret");
    assert.ok(content.includes("api_key:"), "secrets.yaml contains 'api_key' secret");
    assert.ok(content.includes("telegram_token:"), "secrets.yaml contains 'telegram_token' secret");
    
    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("Secrets validation file content", async () => {
    // Open the secrets validation file to verify it has !secret references
    const secretsValidationPath = path.join(workspacePath, "test-secrets-validation.yaml");
    const document = await vscode.workspace.openTextDocument(secretsValidationPath);
    const content = document.getText();
    
    // Verify the file contains expected !secret references
    assert.ok(content.includes("!secret email_password"), "test file contains '!secret email_password' reference");
    assert.ok(content.includes("!secret database_password"), "test file contains '!secret database_password' reference");
    assert.ok(content.includes("!secret api_key") || content.includes("!secret telegram_token"), "test file contains secret references");
    
    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("Goto definition for secrets references", async () => {
    // Create a test file with secrets references
    const testContent = `# Test secrets references
homeassistant:
  name: !secret database_password
  
http:
  base_url: !secret api_key
  api_password: !secret telegram_token

# Test with different formatting
automation:
  - alias: "Test automation"
    trigger:
      platform: state
      entity_id: sensor.test
    action:
      - service: notify.test
        data:
          message: !secret email_password
          api_key: !secret api_key
`;

    const document = await createTestFile(testContent, "test-secrets-goto.yaml");
    
    // Wait for language server to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test goto definition for "!secret database_password" on line 3
    const databasePasswordPosition = new vscode.Position(2, 23); // Position of "database_password" in "!secret database_password"
    const databasePasswordDefinitions = await getDefinitionsAt(document, databasePasswordPosition);
    
    assert.ok(databasePasswordDefinitions, "Should provide definitions for '!secret database_password'");
    assert.ok(databasePasswordDefinitions && databasePasswordDefinitions.length > 0, "Should have at least one definition for 'database_password'");
    
    if (databasePasswordDefinitions && databasePasswordDefinitions.length > 0) {
      const definition = databasePasswordDefinitions[0];
      
      // Verify the definition points to secrets.yaml
      assert.ok(definition.uri.fsPath.endsWith("secrets.yaml"), "Definition should point to secrets.yaml");
      
      // Verify the definition points to the correct line (database_password should be line 1 in secrets.yaml)
      assert.strictEqual(definition.range.start.line, 1, "Definition should point to line 1 (database_password secret)");
      
      console.log(`Found definition for 'database_password' at ${definition.uri.fsPath}:${definition.range.start.line}:${definition.range.start.character}`);
    }
    
    // Test goto definition for "!secret api_key" on line 6
    const apiKeyPosition = new vscode.Position(5, 18); // Position of "api_key" in "!secret api_key"
    const apiKeyDefinitions = await getDefinitionsAt(document, apiKeyPosition);
    
    assert.ok(apiKeyDefinitions, "Should provide definitions for '!secret api_key'");
    assert.ok(apiKeyDefinitions && apiKeyDefinitions.length > 0, "Should have at least one definition for 'api_key'");
    
    if (apiKeyDefinitions && apiKeyDefinitions.length > 0) {
      const definition = apiKeyDefinitions[0];
      
      // Verify the definition points to secrets.yaml
      assert.ok(definition.uri.fsPath.endsWith("secrets.yaml"), "Definition should point to secrets.yaml");
      
      // Verify the definition points to the correct line (api_key should be line 2 in secrets.yaml)
      assert.strictEqual(definition.range.start.line, 2, "Definition should point to line 2 (api_key secret)");
      
      console.log(`Found definition for 'api_key' at ${definition.uri.fsPath}:${definition.range.start.line}:${definition.range.start.character}`);
    }
    
    // Test goto definition for "!secret telegram_token" on line 7
    const telegramTokenPosition = new vscode.Position(6, 25); // Position of "telegram_token" in "!secret telegram_token"
    const telegramTokenDefinitions = await getDefinitionsAt(document, telegramTokenPosition);
    
    assert.ok(telegramTokenDefinitions, "Should provide definitions for '!secret telegram_token'");
    assert.ok(telegramTokenDefinitions && telegramTokenDefinitions.length > 0, "Should have at least one definition for 'telegram_token'");
    
    if (telegramTokenDefinitions && telegramTokenDefinitions.length > 0) {
      const definition = telegramTokenDefinitions[0];
      
      // Verify the definition points to secrets.yaml
      assert.ok(definition.uri.fsPath.endsWith("secrets.yaml"), "Definition should point to secrets.yaml");
      
      // Verify the definition points to the correct line (telegram_token should be line 6 in secrets.yaml)
      assert.strictEqual(definition.range.start.line, 6, "Definition should point to line 6 (telegram_token secret)");
      
      console.log(`Found definition for 'telegram_token' at ${definition.uri.fsPath}:${definition.range.start.line}:${definition.range.start.character}`);
    }
    
    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("Goto definition for secrets in nested context", async () => {
    // Test goto definition in more complex YAML contexts
    const testContent = `# Test nested secrets
sensor:
  - platform: template
    sensors:
      test_sensor:
        value_template: "{{ states('sensor.temp') }}"
        friendly_name: !secret email_password
        api_key: !secret api_key

notify:
  - platform: telegram
    name: telegram
    chat_id: !secret telegram_chat_id
    api_key: !secret api_key

rest_command:
  test_command:
    url: !secret database_password
    method: POST
    headers:
      Authorization: "Bearer !secret api_key"
`;

    const document = await createTestFile(testContent, "test-secrets-nested.yaml");
    
    // Wait for language server to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test goto definition for secrets in various contexts
    const positions = [
      { line: 6, character: 35, name: "email_password" },      // friendly_name: !secret email_password
      { line: 7, character: 23, name: "api_key" },      // api_key: !secret api_key
      { line: 12, character: 22, name: "telegram_chat_id" }, // chat_id: !secret telegram_chat_id (non-existent)
      { line: 13, character: 19, name: "api_key" },     // api_key: !secret api_key
      { line: 17, character: 27, name: "database_password" },      // url: !secret database_password
      { line: 20, character: 32, name: "api_key" }      // Authorization: "Bearer !secret api_key"
    ];
    
    for (const pos of positions) {
      const position = new vscode.Position(pos.line, pos.character);
      const definitions = await getDefinitionsAt(document, position);
      
      if (pos.name === "telegram_chat_id") {
        // This secret doesn't exist in secrets.yaml, so should not have definitions
        assert.ok(!definitions || definitions.length === 0, `Should not have definitions for non-existent secret '${pos.name}'`);
      } else {
        // These secrets exist, so should have definitions
        assert.ok(definitions && definitions.length > 0, `Should have definitions for secret '${pos.name}' at line ${pos.line}`);
        
        if (definitions && definitions.length > 0) {
          const definition = definitions[0];
          assert.ok(definition.uri.fsPath.endsWith("secrets.yaml"), `Definition for '${pos.name}' should point to secrets.yaml`);
          console.log(`Found definition for '${pos.name}' at line ${pos.line}`);
        }
      }
    }
    
    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("No goto definition for invalid secret syntax", async () => {
    // Test that invalid syntax doesn't trigger goto definition
    const testContent = `# Test invalid secret syntax
homeassistant:
  name: secret welcome         # Missing !
  base_url: !secretwelcome     # Missing space
  api_key: ! secret api_key    # Extra space
  value: "!secret welcome"     # In quotes
  comment: # !secret welcome   # In comment
`;

    const document = await createTestFile(testContent, "test-secrets-invalid.yaml");
    
    // Wait for language server to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test positions that should not trigger goto definition
    const invalidPositions = [
      { line: 2, character: 15, description: "secret without !" },
      { line: 3, character: 20, description: "!secret without space" },
      { line: 4, character: 25, description: "! secret with extra space" },
      { line: 5, character: 20, description: "!secret in quotes" },
      { line: 6, character: 20, description: "!secret in comment" }
    ];
    
    for (const pos of invalidPositions) {
      const position = new vscode.Position(pos.line, pos.character);
      const definitions = await getDefinitionsAt(document, position);
      
      // Should not have any definitions for invalid syntax
      assert.ok(!definitions || definitions.length === 0, 
        `Should not have definitions for ${pos.description} at line ${pos.line}`);
    }
    
    // Close the document
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("Error handling for missing secrets.yaml", async () => {
    // Temporarily rename secrets.yaml to test error handling
    const secretsPath = path.join(workspacePath, "secrets.yaml");
    const backupPath = path.join(workspacePath, "secrets.yaml.backup");
    
    // Backup the original file
    await fs.rename(secretsPath, backupPath);
    
    try {
      const testContent = `# Test with missing secrets.yaml
homeassistant:
  name: !secret welcome
`;

      const document = await createTestFile(testContent, "test-missing-secrets.yaml");
      
      // Wait for language server to initialize
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test goto definition when secrets.yaml doesn't exist
      const position = new vscode.Position(2, 15); // Position of "welcome" in "!secret welcome"
      const definitions = await getDefinitionsAt(document, position);
      
      // Should not have any definitions when secrets.yaml is missing
      assert.ok(!definitions || definitions.length === 0, 
        "Should not have definitions when secrets.yaml is missing");
      
      // Close the document
      await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
      
    } finally {
      // Restore the original file
      await fs.rename(backupPath, secretsPath);
    }
  });
});
