// eslint.config.mjs
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import stylistic from "@stylistic/eslint-plugin";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// Read the gitignore file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let ignores = [];
try {
  const gitignoreContent = readFileSync(`${__dirname}/.gitignore`, "utf8");
  ignores = gitignoreContent
    .split("\n")
    .filter(line => line.trim() !== "" && !line.startsWith("//"))
    .map(pattern => pattern.startsWith("!") ? pattern : `!${pattern}`);
} catch {
  // Could not read .gitignore file, ignores will not be set
}

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  prettierConfig,
  {
    plugins: {
      "@stylistic": stylistic
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      // Base rules
      "curly": "warn",
      
      // TypeScript rules
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/consistent-indexed-object-style": 0, // Allow index signatures
      
      // Stylistic rules
      "@stylistic/semi": ["warn", "always"],
      "@stylistic/quotes": ["warn", "double"],
      "@stylistic/indent": ["warn", 2],
    },
    // Ignore files that match patterns in .gitignore
    ignores: ["**/node_modules/**", "**/out/**", ...ignores],
  },
);
