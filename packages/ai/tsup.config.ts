import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    renderer: "src/renderer/index.ts",
    generate: "src/generate/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    "react",
    "react-dom",
    "zod",
    "@entropix/core",
    "@entropix/react",
    "@entropix/react-native",
    "@entropix/data",
    "@entropix/data-native",
  ],
});
