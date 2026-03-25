import React from "react";
import type { UINode } from "../spec/types.js";

interface ErrorBoundaryProps {
  fallback: React.ComponentType<{ error: Error; node: UINode }>;
  node: UINode;
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * React error boundary that catches rendering errors in individual nodes.
 * Renders the provided fallback component with the error and offending node.
 */
export class NodeErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override render(): React.ReactNode {
    if (this.state.error) {
      const FallbackComponent = this.props.fallback;
      return React.createElement(FallbackComponent, {
        error: this.state.error,
        node: this.props.node,
      });
    }
    return this.props.children;
  }
}
