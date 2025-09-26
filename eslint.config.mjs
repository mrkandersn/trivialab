import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      // warn when using console.log; allow console.warn and console.error
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  },
  pluginReact.configs.flat.recommended,
]);
