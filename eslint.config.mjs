import js from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  { languageOptions: { globals: globals.jest } },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    extends: [eslintReact.configs.recommended],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Used via forms helpers (RequiredField(this, ...)) and parent refs (ed.validate()).
      "@eslint-react/no-unused-class-component-members": "off",
    },
  },
]);
