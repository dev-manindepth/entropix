"use client";

import { createWebComponentMap } from "@entropix/ai";
import type { ComponentMap } from "@entropix/ai";
import * as EntropixReact from "@entropix/react";
import * as EntropixData from "@entropix/data";

const baseMap = createWebComponentMap(
  EntropixReact as unknown as Record<string, unknown>,
  EntropixData as unknown as Record<string, unknown>,
);

// Add HTML element fallbacks for when the LLM generates native elements
// These render as their native HTML equivalents
const HTML_FALLBACKS: Record<string, string> = {
  h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h5", h6: "h6",
  p: "p", span: "span", div: "div", section: "section", article: "article",
  nav: "nav", header: "header", footer: "footer", main: "main", aside: "aside",
  ul: "ul", ol: "ol", li: "li", a: "a", img: "img", strong: "strong", em: "em",
  hr: "hr", br: "br", label: "label", form: "form",
};

const htmlComponents: ComponentMap = {};
for (const [name, tag] of Object.entries(HTML_FALLBACKS)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  htmlComponents[name] = tag as any;
}

export const COMPONENT_MAP: ComponentMap = {
  ...htmlComponents,
  ...baseMap, // Entropix components take priority over HTML fallbacks
};
