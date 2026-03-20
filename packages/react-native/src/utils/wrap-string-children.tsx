import React from "react";
import { Text, type TextStyle } from "react-native";

/**
 * Wraps raw string/number children in a <Text> component.
 *
 * In React Native, strings cannot be rendered directly inside
 * View or Pressable — they must be inside a <Text> element.
 * React elements are passed through unchanged.
 */
export function wrapStringChildren(
  children: React.ReactNode,
  style?: TextStyle,
): React.ReactNode {
  if (typeof children === "string" || typeof children === "number") {
    return <Text style={style}>{children}</Text>;
  }
  return children;
}
