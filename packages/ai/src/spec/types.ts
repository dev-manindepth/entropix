/** Action reference -- consumer wires to real handler */
export interface UIAction {
  $action: string;
  payload?: Record<string, unknown>;
}

/** Dynamic data binding -- resolved from data context */
export interface UIBinding {
  $bind: string; // dot-path: "user.name", "items[0].price"
}

/** Design token reference */
export interface UITokenRef {
  $token: string; // "color-action-primary-default"
}

/** Conditional rendering */
export interface UIConditional {
  $if: string; // binding path that must be truthy
  then: UIChild;
  else?: UIChild;
}

/** Loop over data */
export interface UILoop {
  $each: string; // binding path to array
  as: string; // iterator variable name
  render: UINode;
  key?: string; // key expression path
}

export type UINodePropValue =
  | string
  | number
  | boolean
  | null
  | UINodePropValue[]
  | { [key: string]: UINodePropValue }
  | UIAction
  | UIBinding
  | UITokenRef;

export type UIChild =
  | string
  | UINode
  | Array<string | UINode | UIConditional | UILoop>;

export interface UINode {
  component: string;
  props?: Record<string, UINodePropValue>;
  children?: UIChild;
  key?: string;
}

export interface UISpec {
  version: "1.0";
  root: UINode | UINode[];
  meta?: {
    title?: string;
    description?: string;
    generatedBy?: string;
    generatedAt?: string;
  };
}
