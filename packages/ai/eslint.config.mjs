import { config } from "@entropix/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ["test-e2e.ts"],
  },
];
