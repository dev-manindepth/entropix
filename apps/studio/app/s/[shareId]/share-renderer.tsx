"use client";

import { EntropixRenderer, createWebComponentMap } from "@entropix/ai";
import type { UISpec, ComponentMap } from "@entropix/ai";
import * as EntropixReact from "@entropix/react";
import * as EntropixData from "@entropix/data";

const baseMap = createWebComponentMap(
  EntropixReact as unknown as Record<string, unknown>,
  EntropixData as unknown as Record<string, unknown>,
);

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

const COMPONENT_MAP: ComponentMap = {
  ...htmlComponents,
  ...baseMap,
};

interface ShareRendererProps {
  spec: UISpec;
  title: string;
}

export function ShareRenderer({ spec, title }: ShareRendererProps) {
  return (
    <div style={{ padding: "var(--entropix-spacing-4)" }}>
      <EntropixRenderer spec={spec} components={COMPONENT_MAP} />
    </div>
  );
}
