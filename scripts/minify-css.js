#!/usr/bin/env node
/**
 * Minifies CSS files from src/styles/ to dist/styles/ using lightningcss.
 * Called as a post-build step by tsup's onSuccess hook.
 */
const { transform } = require("lightningcss");
const fs = require("fs");
const path = require("path");

const srcDir = path.resolve(process.cwd(), "src/styles");
const outDir = path.resolve(process.cwd(), "dist/styles");

if (!fs.existsSync(srcDir)) {
  console.log("No src/styles/ directory found, skipping CSS minification.");
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".css"));
let totalOriginal = 0;
let totalMinified = 0;

for (const file of files) {
  const code = fs.readFileSync(path.join(srcDir, file));
  const result = transform({
    filename: file,
    code,
    minify: true,
  });
  fs.writeFileSync(path.join(outDir, file), result.code);
  totalOriginal += code.length;
  totalMinified += result.code.length;
}

const saved = totalOriginal - totalMinified;
const pct = totalOriginal > 0 ? ((saved / totalOriginal) * 100).toFixed(1) : 0;
console.log(
  `CSS minified: ${files.length} files, ${totalOriginal}B → ${totalMinified}B (saved ${saved}B / ${pct}%)`
);
