import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";

suite("Include Diagnostics Issue #3959", () => {
  suiteSetup(async () => {
    await vscode.extensions
      .getExtension("keesschollaart.vscode-home-assistant")
      ?.activate();
  });

  test("Directory includes should not produce schema diagnostics", async () => {
    const workspacePath =
      vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";
    const configPath = path.join(workspacePath, "configuration.yaml");
    const document = await vscode.workspace.openTextDocument(configPath);

    await vscode.window.showTextDocument(document);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    for (const diagnostic of diagnostics) {
      console.log(
        `Line ${diagnostic.range.start.line + 1}: ${diagnostic.message} ` +
          `(${diagnostic.source}, code: ${diagnostic.code})`,
      );
    }
    const lines = document.getText().split(/\r?\n/);
    const includeLines = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.includes("!include_dir_"));

    assert.ok(includeLines.length > 0, "Test fixture contains directory includes");

    for (const includeLine of includeLines) {
      const schemaDiagnostics = diagnostics.filter(
        (diagnostic) =>
          diagnostic.range.start.line === includeLine.index &&
          (diagnostic.source?.startsWith("yaml-schema") ||
            diagnostic.code === "patternWarning"),
      );

      assert.strictEqual(
        schemaDiagnostics.length,
        0,
        `Directory include should not produce schema diagnostics: ${includeLine.line}`,
      );
    }

    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
});
