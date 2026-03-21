import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "@entropix/core"],
  onSuccess:
    'node -e "const fs=require(\'fs\');fs.cpSync(\'src/styles\',\'dist/styles\',{recursive:true})"',
});
