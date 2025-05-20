// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import { readFileSync } from 'node:fs';
import { globSync } from 'glob';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Read the gitignore file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let ignores = [];
try {
  const gitignoreContent = readFileSync(`${__dirname}/.gitignore`, 'utf8');
  ignores = gitignoreContent
    .split('\n')
    .filter(line => line.trim() !== '' && !line.startsWith('//'))
    .map(pattern => pattern.startsWith('!') ? pattern : `!${pattern}`);
} catch (err) {
  console.warn('Could not read .gitignore file, ignores will not be set', err);
}

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unused-vars': 0,
    },
    // Ignore files that match patterns in .gitignore
    ignores: ['**/node_modules/**', '**/out/**', ...ignores],
  },
);
