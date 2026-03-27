import type {
  UISpec,
  UINode,
  UIChild,
  UINodePropValue,
  UIConditional,
  UILoop,
} from "../spec/types.js";

export interface CodeExportOptions {
  spec: UISpec;
  format?: "component" | "page";
  componentName?: string;
}

export interface CodeExportResult {
  code: string;
  imports: string[];
  dependencies: string[];
}

/** Components that belong to @entropix/data */
const DATA_COMPONENTS = new Set([
  "DataTable",
  "BarChart",
  "LineChart",
  "AreaChart",
  "PieChart",
  "DonutChart",
  "Sparkline",
  "StatCard",
  "KPICard",
  "Metric",
]);

function getPackageForComponent(name: string): string {
  if (DATA_COMPONENTS.has(name)) {
    return "@entropix/data";
  }
  return "@entropix/react";
}

function formatPropValue(value: UINodePropValue): string {
  if (value === null) {
    return "{null}";
  }
  if (typeof value === "string") {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  if (typeof value === "number") {
    return `{${value}}`;
  }
  if (typeof value === "boolean") {
    return `{${value}}`;
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    // $bind
    if ("$bind" in value && typeof value.$bind === "string") {
      return `{data.${value.$bind}}`;
    }
    // $action
    if ("$action" in value && typeof value.$action === "string") {
      const actionValue = value as { $action: string; payload?: Record<string, unknown> };
      if (actionValue.payload && Object.keys(actionValue.payload).length > 0) {
        return `{() => onAction("${actionValue.$action}", ${JSON.stringify(actionValue.payload)})}`;
      }
      return `{() => onAction("${actionValue.$action}")}`;
    }
    // $token
    if ("$token" in value && typeof value.$token === "string") {
      return `"var(--entropix-${value.$token})"`;
    }

    // Plain object prop value
    return `{${JSON.stringify(value)}}`;
  }

  if (Array.isArray(value)) {
    return `{${JSON.stringify(value)}}`;
  }

  return `{${JSON.stringify(value)}}`;
}

function nodeToJSX(node: UINode, level: number, components: Set<string>): string {
  const { component, props, children } = node;
  components.add(component);

  const propsStr = props
    ? Object.entries(props)
        .map(([key, val]) => ` ${key}=${formatPropValue(val)}`)
        .join("")
    : "";

  if (!children) {
    return `${" ".repeat(level * 2)}<${component}${propsStr} />`;
  }

  const childrenJSX = childToJSX(children, level + 1, components);

  return [
    `${" ".repeat(level * 2)}<${component}${propsStr}>`,
    childrenJSX,
    `${" ".repeat(level * 2)}</${component}>`,
  ].join("\n");
}

function childToJSX(
  child: UIChild,
  level: number,
  components: Set<string>,
): string {
  const pad = " ".repeat(level * 2);

  if (typeof child === "string") {
    return `${pad}${child}`;
  }

  if (Array.isArray(child)) {
    return child
      .map((item) => {
        if (typeof item === "string") {
          return `${pad}${item}`;
        }
        if ("$if" in item) {
          return conditionalToJSX(item as UIConditional, level, components);
        }
        if ("$each" in item) {
          return loopToJSX(item as UILoop, level, components);
        }
        return nodeToJSX(item as UINode, level, components);
      })
      .join("\n");
  }

  // Single UINode
  return nodeToJSX(child as UINode, level, components);
}

function conditionalToJSX(
  cond: UIConditional,
  level: number,
  components: Set<string>,
): string {
  const pad = " ".repeat(level * 2);
  const thenJSX = childToJSX(cond.then, level + 1, components);

  if (cond.else) {
    const elseJSX = childToJSX(cond.else, level + 1, components);
    return [
      `${pad}{data.${cond.$if} ? (`,
      thenJSX,
      `${pad}) : (`,
      elseJSX,
      `${pad})}`,
    ].join("\n");
  }

  return [
    `${pad}{data.${cond.$if} && (`,
    thenJSX,
    `${pad})}`,
  ].join("\n");
}

function loopToJSX(
  loop: UILoop,
  level: number,
  components: Set<string>,
): string {
  const pad = " ".repeat(level * 2);
  const itemJSX = nodeToJSX(loop.render, level + 1, components);

  return [
    `${pad}{data.${loop.$each}.map((${loop.as}, i) => (`,
    itemJSX,
    `${pad}))}`,
  ].join("\n");
}

export function specToCode(options: CodeExportOptions): CodeExportResult {
  const { spec, format = "component", componentName } = options;

  const name =
    componentName ||
    spec.meta?.title?.replace(/[^a-zA-Z0-9]/g, "") ||
    "GeneratedUI";

  const components = new Set<string>();

  // Generate JSX from root
  let jsx: string;
  if (Array.isArray(spec.root)) {
    jsx = spec.root
      .map((node) => nodeToJSX(node, format === "page" ? 2 : 1, components))
      .join("\n");
    // Wrap multiple roots in a fragment
    const pad = format === "page" ? "    " : "  ";
    jsx = `${pad}<>\n${jsx}\n${pad}</>`;
  } else {
    jsx = nodeToJSX(spec.root, format === "page" ? 2 : 1, components);
  }

  // Build import map: package -> component names
  const importMap = new Map<string, string[]>();
  for (const comp of components) {
    const pkg = getPackageForComponent(comp);
    if (!importMap.has(pkg)) {
      importMap.set(pkg, []);
    }
    importMap.get(pkg)!.push(comp);
  }

  // Sort component names within each import
  for (const [, comps] of importMap) {
    comps.sort();
  }

  const importLines: string[] = [];
  const imports: string[] = [];

  // Sort packages for deterministic output
  const sortedPackages = [...importMap.keys()].sort();
  for (const pkg of sortedPackages) {
    const comps = importMap.get(pkg)!;
    importLines.push(`import { ${comps.join(", ")} } from "${pkg}";`);
    imports.push(pkg);
  }

  // Dependencies include all import packages + tokens
  const dependencies = [...new Set([...imports, "@entropix/tokens"])];

  if (format === "page") {
    const code = [
      ...importLines,
      "",
      `export function ${name}({ data, onAction }) {`,
      "  return (",
      jsx,
      "  );",
      "}",
      "",
    ].join("\n");

    return { code, imports, dependencies };
  }

  // "component" format — just the JSX tree
  const code = jsx;

  return { code, imports, dependencies };
}
