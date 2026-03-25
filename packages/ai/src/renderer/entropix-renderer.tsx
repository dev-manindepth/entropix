import React, { createElement } from "react";
import type { EntropixRendererProps } from "./types.js";
import type { UINode } from "../spec/types.js";
import type { DataContext } from "./types.js";
import { resolveProps } from "./resolve-props.js";
import { resolveChildren } from "./resolve-children.js";
import { NodeErrorBoundary } from "./error-boundary.js";

/** Default fallback shown when a component is missing from the map */
function DefaultMissing({ node }: { node: UINode }) {
  return createElement(
    "div",
    {
      style: {
        border: "1px dashed red",
        padding: "8px",
        margin: "4px",
        fontSize: "12px",
        color: "red",
      },
    },
    `Unknown component: "${node.component}"`,
  );
}

/** Default error fallback shown when a component throws during render */
function DefaultErrorFallback({
  error,
  node,
}: {
  error: Error;
  node: UINode;
}) {
  return createElement(
    "div",
    {
      style: {
        border: "1px solid red",
        padding: "8px",
        margin: "4px",
        fontSize: "12px",
        color: "red",
        background: "#fff0f0",
      },
    },
    `Error rendering "${node.component}": ${error.message}`,
  );
}

/**
 * The Entropix UI Spec renderer.
 *
 * Takes a declarative `UISpec` and a `ComponentMap`, resolves bindings,
 * actions, tokens, conditionals, and loops, and renders the result as
 * a React element tree.
 */
export function EntropixRenderer({
  spec,
  components,
  data = {},
  onAction,
  fallback: FallbackComponent = DefaultErrorFallback,
  className,
}: EntropixRendererProps): React.ReactElement {
  function renderNode(
    node: UINode,
    nodeData: DataContext,
  ): React.ReactNode {
    const Component = components[node.component];

    // Unknown component
    if (!Component) {
      return createElement(DefaultMissing, {
        node,
        key: node.key,
      } as { node: UINode; key?: string });
    }

    // Resolve props
    const resolvedProps: Record<string, unknown> = node.props
      ? resolveProps(node.props, nodeData, onAction)
      : {};

    if (node.key) {
      resolvedProps.key = node.key;
    }

    // Resolve children
    let resolvedChildren: React.ReactNode = null;
    if (node.children != null) {
      resolvedChildren = resolveChildren(
        node.children,
        nodeData,
        onAction,
        components,
        renderNode,
      );
    }

    // Wrap in error boundary
    return createElement(
      NodeErrorBoundary,
      { fallback: FallbackComponent, node, key: node.key },
      createElement(Component, resolvedProps, resolvedChildren),
    );
  }

  const roots = Array.isArray(spec.root) ? spec.root : [spec.root];
  const rendered = roots.map((node, index) =>
    createElement(
      React.Fragment,
      { key: node.key ?? String(index) },
      renderNode(node, data),
    ),
  );

  if (className) {
    return createElement("div", { className }, ...rendered);
  }

  // If only one root, avoid extra fragment wrapper
  if (rendered.length === 1) {
    return rendered[0] as React.ReactElement;
  }

  return createElement(React.Fragment, null, ...rendered);
}
