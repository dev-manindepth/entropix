export type ComponentCategory =
  | "action"
  | "input"
  | "display"
  | "overlay"
  | "navigation"
  | "data"
  | "layout"
  | "feedback";

export type Platform = "web" | "native" | "both";

export interface PropDef {
  name: string;
  type: string; // TS type as string
  required: boolean;
  description: string;
  defaultValue?: unknown;
  allowedValues?: readonly (string | number | boolean)[];
  isChildren?: boolean;
  isData?: boolean;
}

export interface CompoundChildDef {
  name: string;
  required: boolean;
  multiple: boolean;
  description: string;
}

export interface ComponentRegistryEntry {
  name: string;
  description: string;
  category: ComponentCategory;
  platform: Platform;
  package: string;
  props: PropDef[];
  acceptsChildren: boolean;
  compoundChildren?: CompoundChildDef[];
  parentComponent?: string;
  examples: Array<{ title: string; spec: unknown }>;
}

export interface ComponentRegistry {
  version: string;
  components: Record<string, ComponentRegistryEntry>;
  categories: Record<ComponentCategory, string>;
}
