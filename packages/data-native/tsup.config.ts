import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "data-table": "src/components/data-table/data-table.tsx",
    "bar-chart": "src/components/bar-chart/index.ts",
    "line-chart": "src/components/line-chart/index.ts",
    "area-chart": "src/components/area-chart/index.ts",
    "pie-chart": "src/components/pie-chart/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-native", "@entropix/core", "@entropix/tokens", "@entropix/react-native"],
});
