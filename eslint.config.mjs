import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a compat instance to use old-style extends (like next/core-web-vitals)
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Extend Next.js + TypeScript recommended configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Custom project-level config
  {
    plugins: {
      "simple-import-sort": require("eslint-plugin-simple-import-sort"),
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
];
