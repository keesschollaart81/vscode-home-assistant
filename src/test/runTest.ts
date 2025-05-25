import * as path from "path";
import { runTests } from "@vscode/test-electron";

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");

    // The path to the extension test runner script
    const extensionTestsPath = path.resolve(__dirname, "./suite/index");
    
    // The path to the workspace to use for testing
    const testWorkspace = path.resolve(extensionDevelopmentPath, "test-workspace");

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        testWorkspace,
        "--disable-extensions" // Disable other extensions to avoid conflicts
      ]
    });
  } catch (err) {
    console.error("Failed to run tests", err);
    process.exit(1);
  }
}

main();
