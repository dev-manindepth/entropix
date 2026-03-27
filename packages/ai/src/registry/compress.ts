import type { ComponentCategory, ComponentRegistry, PropDef } from "./types.js";

/**
 * Compress the component registry into a string representation.
 *
 * @param registry - The full component registry
 * @param mode - Compression mode:
 *   - "compact": One line per component with signature
 *   - "category": Full details filtered to specified categories
 *   - "full": Complete registry as formatted JSON
 * @param categories - Categories to include (only used in "category" mode)
 */
export function compressRegistry(
  registry: ComponentRegistry,
  mode: "compact" | "category" | "full",
  categories?: ComponentCategory[],
): string {
  switch (mode) {
    case "compact":
      return compactMode(registry);
    case "category":
      return categoryMode(registry, categories ?? []);
    case "full":
      return JSON.stringify(registry, null, 2);
  }
}

function isSerializableProp(prop: PropDef): boolean {
  if (prop.isChildren) return false;
  // Exclude function-only props that can't be represented in JSON
  if (prop.type?.includes("=>") && !prop.description?.includes("$action")) return false;
  return true;
}

function formatPropSignature(prop: PropDef): string {
  if (!isSerializableProp(prop)) return "";
  const name = prop.required ? prop.name : `${prop.name}?`;
  const defaultStr =
    prop.defaultValue !== undefined ? ` = ${JSON.stringify(prop.defaultValue)}` : "";
  // For complex types, include the description inline for clarity
  const descHint = prop.description && (prop.type?.includes("[]") || prop.type?.includes("{"))
    ? ` /* ${prop.description} */`
    : "";
  return `${name}: ${prop.type}${defaultStr}${descHint}`;
}

function compactMode(registry: ComponentRegistry): string {
  const lines: string[] = [];

  for (const [, entry] of Object.entries(registry.components)) {
    const propSignatures = entry.props
      .map(formatPropSignature)
      .filter((s) => s.length > 0);

    const signature = propSignatures.join(", ");
    const parent = entry.parentComponent ? ` [parent: ${entry.parentComponent}]` : "";
    const children = entry.acceptsChildren ? " [children]" : "";
    const compound =
      entry.compoundChildren && entry.compoundChildren.length > 0
        ? ` [compound: ${entry.compoundChildren.map((c) => c.name).join(", ")}]`
        : "";

    lines.push(
      `${entry.name}(${signature}) - ${entry.description}${parent}${children}${compound}`,
    );
  }

  return lines.join("\n");
}

function categoryMode(
  registry: ComponentRegistry,
  categories: ComponentCategory[],
): string {
  const categorySet = new Set(categories);
  const filtered: ComponentRegistry = {
    version: registry.version,
    categories: {} as ComponentRegistry["categories"],
    components: {},
  };

  for (const cat of categories) {
    if (registry.categories[cat]) {
      (filtered.categories as Record<string, string>)[cat] = registry.categories[cat];
    }
  }

  for (const [key, entry] of Object.entries(registry.components)) {
    if (categorySet.has(entry.category)) {
      // Filter out non-serializable props for AI consumption
      filtered.components[key] = {
        ...entry,
        props: entry.props.filter(isSerializableProp),
      };
    }
  }

  return JSON.stringify(filtered, null, 2);
}
