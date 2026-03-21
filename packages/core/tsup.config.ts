import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "hooks/use-button": "src/hooks/use-button.ts",
    "hooks/use-toggle": "src/hooks/use-toggle.ts",
    "hooks/use-dialog": "src/hooks/use-dialog.ts",
    "hooks/use-tabs": "src/hooks/use-tabs.ts",
    "hooks/use-accordion": "src/hooks/use-accordion.ts",
    "hooks/use-menu": "src/hooks/use-menu.ts",
    "hooks/use-input": "src/hooks/use-input.ts",
    "hooks/use-select": "src/hooks/use-select.ts",
    "hooks/use-radio-group": "src/hooks/use-radio-group.ts",
    "hooks/use-table": "src/hooks/use-table.ts",
    chart: "src/utils/chart/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  treeshake: true,
  sourcemap: true,
  clean: true,
  external: ["react"],
});
