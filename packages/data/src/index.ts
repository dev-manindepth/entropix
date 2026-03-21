// ─── Components ──────────────────────────────────────────────────────────────
export {
  DataTable,
  DataTableContext,
  useDataTableContext,
} from "./components/data-table/index.js";

export type {
  DataTableProps,
  DataTableContextValue,
} from "./components/data-table/index.js";

// ─── Re-exported types from @entropix/core ───────────────────────────────────
export type {
  ColumnDef,
  SortState,
  SortDirection,
  UseTableOptions,
  UseTableReturn,
} from "@entropix/core";
