// .vscode-test.js
const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
  label: 'Home Assistant Extension Tests',
  files: 'out/test/**/*.test.js',
  workspaceFolder: './test-workspace',
  mocha: {
    ui: 'tdd',
    timeout: 20000,
    color: true
  },
  // Use stable version of VS Code
  version: 'stable',
  // Use Insiders version for development (uncomment to use Insiders)
  // version: 'insiders',
  // Disable all other extensions during tests
  launchArgs: ['--disable-extensions']
});
