import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";
import { VsCodeFileAccessor } from "../../server/fileAccessor";
import { TextDocuments } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

suite("Symlink Protection Tests", () => {
  let workspacePath: string;
  let testDir: string;

  suiteSetup(() => {
    workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";
    testDir = path.join(workspacePath, "test-symlinks");
    vscode.window.showInformationMessage("Starting symlink protection tests...");
  });

  // Clean up test directory after each test
  async function cleanupTestDir() {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore errors during cleanup
    }
  }

  // Setup test directory structure
  async function setupTestDir() {
    await cleanupTestDir();
    await fs.mkdir(testDir, { recursive: true });
  }

  teardown(async () => {
    await cleanupTestDir();
  });

  test("Prevents infinite loop with circular symlink to parent directory", async () => {
    await setupTestDir();

    // Create a directory structure: testDir/subdir
    const subDir = path.join(testDir, "subdir");
    await fs.mkdir(subDir, { recursive: true });

    // Create a test YAML file in the subdirectory
    const testFile = path.join(subDir, "test.yaml");
    await fs.writeFile(testFile, "test: true");

    // Create a symlink that points back to the parent directory
    // This creates a circular reference: testDir/subdir/loop -> testDir
    const symlinkPath = path.join(subDir, "loop");
    try {
      await fs.symlink(testDir, symlinkPath, "dir");
    } catch (error: any) {
      if (error.code === "EPERM") {
        console.log("Skipping symlink test - insufficient permissions on this platform");
        return;
      }
      throw error;
    }

    // Create file accessor
    const documents = new TextDocuments(TextDocument);
    const fileAccessor = new VsCodeFileAccessor(workspacePath, documents);

    // This should not hang or throw - it should handle the circular reference gracefully
    const startTime = Date.now();
    const files = await fileAccessor.getFilesInFolder(testDir);
    const duration = Date.now() - startTime;

    // Should complete in reasonable time (not infinite loop)
    assert.ok(duration < 5000, `File traversal took ${duration}ms, should be much faster (possible infinite loop)`);

    // Should find the test.yaml file exactly once
    const yamlFiles = files.filter(f => f.endsWith("test.yaml"));
    assert.strictEqual(yamlFiles.length, 1, "Should find test.yaml exactly once (not duplicated due to symlink loop)");

    // Should have logged about skipping the already-visited directory
    console.log(`Found ${files.length} files in ${duration}ms`);
  });

  test("Follows non-circular symlinks correctly", async () => {
    await setupTestDir();

    // Create two separate directories
    const dir1 = path.join(testDir, "dir1");
    const dir2 = path.join(testDir, "dir2");
    await fs.mkdir(dir1, { recursive: true });
    await fs.mkdir(dir2, { recursive: true });

    // Create a file in dir2
    const file2 = path.join(dir2, "config.yaml");
    await fs.writeFile(file2, "config: value");

    // Create a symlink from dir1 to dir2 (non-circular)
    const symlinkPath = path.join(dir1, "link-to-dir2");
    try {
      await fs.symlink(dir2, symlinkPath, "dir");
    } catch (error: any) {
      if (error.code === "EPERM") {
        console.log("Skipping symlink test - insufficient permissions on this platform");
        return;
      }
      throw error;
    }

    // Create file accessor
    const documents = new TextDocuments(TextDocument);
    const fileAccessor = new VsCodeFileAccessor(workspacePath, documents);

    // Should find the file through the symlink
    const files = await fileAccessor.getFilesInFolder(testDir);

    // Should find config.yaml only once (accessed via dir2, but not duplicated via symlink)
    const yamlFiles = files.filter(f => f.includes("config.yaml"));
    assert.strictEqual(yamlFiles.length, 1, "Should find config.yaml exactly once");
  });

  test("Handles broken symlinks gracefully", async () => {
    await setupTestDir();

    // Create a file
    const testFile = path.join(testDir, "test.yaml");
    await fs.writeFile(testFile, "test: true");

    // Create a broken symlink (pointing to non-existent location)
    const brokenLink = path.join(testDir, "broken-link");
    try {
      await fs.symlink("/non/existent/path", brokenLink, "dir");
    } catch (error: any) {
      if (error.code === "EPERM") {
        console.log("Skipping symlink test - insufficient permissions on this platform");
        return;
      }
      throw error;
    }

    // Create file accessor
    const documents = new TextDocuments(TextDocument);
    const fileAccessor = new VsCodeFileAccessor(workspacePath, documents);

    // Should not crash when encountering broken symlink
    const files = await fileAccessor.getFilesInFolder(testDir);

    // Should still find the regular file
    const yamlFiles = files.filter(f => f.endsWith("test.yaml"));
    assert.strictEqual(yamlFiles.length, 1, "Should find test.yaml despite broken symlink");
  });

  test("Ignores dot directories correctly", async () => {
    await setupTestDir();

    // Create a .storage directory (common in Home Assistant)
    const storageDir = path.join(testDir, ".storage");
    await fs.mkdir(storageDir, { recursive: true });

    // Create a file in .storage
    const storageFile = path.join(storageDir, "should-not-find.yaml");
    await fs.writeFile(storageFile, "ignored: true");

    // Create a regular file
    const regularFile = path.join(testDir, "should-find.yaml");
    await fs.writeFile(regularFile, "found: true");

    // Create file accessor
    const documents = new TextDocuments(TextDocument);
    const fileAccessor = new VsCodeFileAccessor(workspacePath, documents);

    const files = await fileAccessor.getFilesInFolder(testDir);

    // Should not find the file in .storage
    const ignoredFiles = files.filter(f => f.includes(".storage"));
    assert.strictEqual(ignoredFiles.length, 0, "Should not traverse .storage directory");

    // Should find the regular file
    const foundFiles = files.filter(f => f.endsWith("should-find.yaml"));
    assert.strictEqual(foundFiles.length, 1, "Should find regular YAML file");
  });
});
