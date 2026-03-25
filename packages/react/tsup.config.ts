import { defineConfig } from "tsup";
import { execSync } from "child_process";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    button: "src/components/button.tsx",
    toggle: "src/components/toggle.tsx",
    switch: "src/components/switch.tsx",
    dialog: "src/components/dialog/index.ts",
    tabs: "src/components/tabs/index.ts",
    accordion: "src/components/accordion/index.ts",
    menu: "src/components/menu/index.ts",
    input: "src/components/input.tsx",
    textarea: "src/components/textarea.tsx",
    checkbox: "src/components/checkbox.tsx",
    radio: "src/components/radio/index.ts",
    select: "src/components/select/index.ts",
    layout: "src/components/layout/index.ts",
    toast: "src/components/toast/index.ts",
    popover: "src/components/popover/index.ts",
    "date-picker": "src/components/date-picker/index.ts",
    breadcrumb: "src/components/breadcrumb/index.ts",
    pagination: "src/components/pagination/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "@entropix/core"],
  async onSuccess() {
    execSync("node ../../scripts/minify-css.js", { stdio: "inherit" });
  },
});
