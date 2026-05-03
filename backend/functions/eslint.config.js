import js from "@eslint/js";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["node_modules/**", "dist/**"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      "no-restricted-globals": ["error", "name", "length"],
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-console": "off",
    },
  },
  {
    files: ["**/*.spec.*", "**/test/**"],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },
];
