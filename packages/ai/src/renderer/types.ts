import type { UISpec, UINode } from "../spec/types.js";
import type { ComponentRegistry } from "../registry/types.js";
import type React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentMap = Record<string, React.ComponentType<any>>;
export type ActionHandler = (
  actionName: string,
  payload?: Record<string, unknown>,
) => void;
export type DataContext = Record<string, unknown>;

export interface EntropixRendererProps {
  spec: UISpec;
  components: ComponentMap;
  data?: DataContext;
  onAction?: ActionHandler;
  registry?: ComponentRegistry;
  fallback?: React.ComponentType<{ error: Error; node: UINode }>;
  className?: string;
}
