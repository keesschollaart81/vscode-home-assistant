import { HomeAssistantYamlFile } from "./src/language-service/src/haConfig/haYamlFile";
import { FileAccessor } from "./src/language-service/src/fileAccessor";
import * as fs from "fs";
import * as path from "path";

// Simple file accessor implementation for testing
class TestFileAccessor implements FileAccessor {
  constructor() {}

  async getFileContents(fileName: string): Promise<string> {
    try {
      return fs.readFileSync(fileName, "utf8");
    } catch (error) {
      console.error(`Error reading file ${fileName}:`, error);
      return "";
    }
  }

  getFilesInFolder(subFolder: string): string[] {
    try {
      return fs.readdirSync(subFolder).filter(f => f.endsWith(".yaml") || f.endsWith(".yml"));
    } catch {
      return [];
    }
  }

  fromUriToLocalPath(uri: string): string {
    // Simple URI to path conversion for testing
    return uri.replace("file://", "");
  }

  getRelativePath(from: string, to: string): string {
    return path.resolve(path.dirname(from), to);
  }

  getRelativePathAsFileUri(relativeFrom: string, filename: string): string {
    const fullPath = this.getRelativePath(relativeFrom, filename);
    return `file://${fullPath}`;
  }

  getFilesInFolderRelativeFrom(folder: string, from: string): string[] {
    // Simple implementation for testing
    try {
      const absoluteFolder = path.resolve(path.dirname(from), folder);
      return fs.readdirSync(absoluteFolder).filter(f => f.endsWith(".yaml") || f.endsWith(".yml"));
    } catch {
      return [];
    }
  }

  getFilesInFolderRelativeFromAsFileUri(subFolder: string, relativeFrom: string): string[] {
    return this.getFilesInFolderRelativeFrom(subFolder, relativeFrom).map(file => 
      `file://${path.resolve(path.dirname(relativeFrom), subFolder, file)}`
    );
  }
}

async function testPositionTracking() {
  console.log("Testing YAML v2 position tracking implementation...");
  
  const testFilePath = path.join(__dirname, "test-position-tracking.yaml");
  const content = fs.readFileSync(testFilePath, "utf8");
  
  console.log("Test file content:");
  console.log(content);
  console.log("\n--- Position Tracking Test ---");
  
  const fileAccessor = new TestFileAccessor();
  const yamlFile = new HomeAssistantYamlFile(fileAccessor, testFilePath, "configuration.yaml");
  
  // Get scripts (this will trigger parsing)
  const scripts = await yamlFile.getScripts();
  
  console.log("Detected scripts with positions:");
  console.log(JSON.stringify(scripts, null, 2));
  
  // Verify we have the expected scripts
  const scriptKeys = Object.keys(scripts);
  console.log(`\nFound ${scriptKeys.length} scripts: ${scriptKeys.join(", ")}`);
  
  // Check that positions are not [0,0] (which would indicate position tracking failed)
  let positionTrackingWorking = true;
  for (const [scriptId, scriptInfo] of Object.entries(scripts)) {
    const hasValidPosition = scriptInfo.start[0] > 0 || scriptInfo.start[1] > 0;
    console.log(`Script "${scriptId}": position [${scriptInfo.start.join(", ")}] - ${hasValidPosition ? "VALID" : "INVALID (0,0)"}`);
    if (!hasValidPosition) {
      positionTrackingWorking = false;
    }
  }
  
  console.log(`\nPosition tracking status: ${positionTrackingWorking ? "WORKING ✅" : "NOT WORKING ❌"}`);
  return positionTrackingWorking;
}

testPositionTracking().then(success => {
  console.log(`\nTest ${success ? "PASSED" : "FAILED"}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error("Test failed with error:", error);
  process.exit(1);
});
