import * as path from "path";
import Mocha from "mocha";
import { glob } from "glob";

export async function run(): Promise<void> {
  // Create the Mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true
  });

  const testsRoot = path.resolve(__dirname, "..");
  
  // Find all test files
  const files = await glob("**/**.test.js", { cwd: testsRoot });
  
  // Add files to the test suite
  files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));
  
  try {
    // Run the tests
    return new Promise<void>((resolve, reject) => {
      mocha.run((failures: number) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    });
  } catch (err) {
    console.error("Failed to run tests:", err);
    throw err;
  }
}
