import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Node-specific files (serverless functions, scripts)
  {
    files: ["netlify/functions/**/*.{js,mjs,cjs}", "scripts/**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.node },
    rules: {
      // allow console in functions/scripts for debugging
      "no-console": "off",
    },
  },
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
