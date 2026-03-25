import React from "react";
import type {
  UIChild,
  UINode,
  UIConditional,
  UILoop,
} from "../spec/types.js";
import type { DataContext, ActionHandler, ComponentMap } from "./types.js";
import { resolvePath } from "./resolve-props.js";

/** Check if a value is a UIConditional */
export function isConditional(v: unknown): v is UIConditional {
  return !!v && typeof v === "object" && "$if" in v;
}

/** Check if a value is a UILoop */
export function isLoop(v: unknown): v is UILoop {
  return !!v && typeof v === "object" && "$each" in v;
}

/**
 * Resolve a `UIChild` tree into React elements.
 *
 * Handles plain strings, UINode objects, arrays (which may contain
 * strings, nodes, conditionals, and loops), conditionals (`$if`),
 * and loops (`$each`).
 */
export function resolveChildren(
  children: UIChild,
  data: DataContext,
  onAction: ActionHandler | undefined,
  _components: ComponentMap,
  renderNode: (node: UINode, data: DataContext) => React.ReactNode,
): React.ReactNode {
  // String children
  if (typeof children === "string") {
    return children;
  }

  // Single UINode (has `component` key)
  if (!Array.isArray(children) && isUINode(children)) {
    return renderNode(children, data);
  }

  // Array of children
  if (Array.isArray(children)) {
    return children.map((child, index) =>
      resolveChildItem(child, index, data, onAction, _components, renderNode),
    );
  }

  return null;
}

function resolveChildItem(
  child: string | UINode | UIConditional | UILoop,
  index: number,
  data: DataContext,
  onAction: ActionHandler | undefined,
  components: ComponentMap,
  renderNode: (node: UINode, data: DataContext) => React.ReactNode,
): React.ReactNode {
  // String
  if (typeof child === "string") {
    return child;
  }

  // Conditional
  if (isConditional(child)) {
    return resolveConditional(child, data, onAction, components, renderNode);
  }

  // Loop
  if (isLoop(child)) {
    return resolveLoop(child, index, data, onAction, components, renderNode);
  }

  // UINode
  if (isUINode(child)) {
    return renderNode(child, data);
  }

  return null;
}

function resolveConditional(
  cond: UIConditional,
  data: DataContext,
  onAction: ActionHandler | undefined,
  components: ComponentMap,
  renderNode: (node: UINode, data: DataContext) => React.ReactNode,
): React.ReactNode {
  const conditionValue = resolvePath(data, cond.$if);
  const branch = conditionValue ? cond.then : cond.else;

  if (branch == null) return null;

  return resolveChildren(branch, data, onAction, components, renderNode);
}

function resolveLoop(
  loop: UILoop,
  _parentIndex: number,
  data: DataContext,
  onAction: ActionHandler | undefined,
  components: ComponentMap,
  renderNode: (node: UINode, data: DataContext) => React.ReactNode,
): React.ReactNode {
  const items = resolvePath(data, loop.$each);

  if (!Array.isArray(items)) return null;

  return items.map((item: unknown, i: number) => {
    // Extend data context with the iterator variable
    const childData: DataContext = {
      ...data,
      [loop.as]: item,
      [`${loop.as}Index`]: i,
    };

    const key = loop.key
      ? String(resolvePath(childData, loop.key) ?? i)
      : String(i);

    const rendered = renderNode(loop.render, childData);

    // Wrap in a fragment with a key so React can reconcile
    return React.createElement(React.Fragment, { key }, rendered);
  });
}

function isUINode(v: unknown): v is UINode {
  return !!v && typeof v === "object" && "component" in v;
}
