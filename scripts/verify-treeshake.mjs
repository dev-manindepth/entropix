#!/usr/bin/env node
/**
 * Verifies tree shaking works correctly by bundling a single-component import
 * and checking that unused component code is NOT included in the output.
 */
import { build } from "esbuild";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const TMP = join(ROOT, ".tmp-treeshake-test.js");

const tests = [
  {
    name: "Button-only from @entropix/react",
    code: `import { Button } from "./packages/react/dist/index.js"; console.log(Button);`,
    mustNotInclude: ["useDialog", "useMenu", "useTabs", "useAccordion"],
  },
  {
    name: "useButton-only from @entropix/core",
    code: `import { useButton } from "./packages/core/dist/index.js"; console.log(useButton);`,
    mustNotInclude: ["computeArcGeometry", "computeBarGeometry", "useTable"],
  },
];

let failed = false;

for (const test of tests) {
  writeFileSync(TMP, test.code);

  const result = await build({
    entryPoints: [TMP],
    bundle: true,
    write: false,
    external: ["react", "react-dom", "react-native"],
    format: "esm",
    treeShaking: true,
    minify: false,
  });

  const output = result.outputFiles[0].text;
  const sizeKB = (result.outputFiles[0].contents.length / 1024).toFixed(1);
  const failures = test.mustNotInclude.filter((s) => output.includes(s));

  if (failures.length > 0) {
    console.error(`  ✗ ${test.name} (${sizeKB}KB) — FAIL: found ${failures.join(", ")}`);
    failed = true;
  } else {
    console.log(`  ✓ ${test.name} (${sizeKB}KB) — tree shaking OK`);
  }
}

try { unlinkSync(TMP); } catch {}

if (failed) {
  console.error("\nTree shaking verification FAILED");
  process.exit(1);
} else {
  console.log("\nAll tree shaking checks passed ✓");
}
