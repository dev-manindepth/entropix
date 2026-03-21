import { createContext, useContext } from "react";
import type { UseTableReturn, ColumnDef } from "@entropix/core";

export interface DataTableContextValue<TData = unknown>
  extends UseTableReturn<TData> {
  columns: ColumnDef<TData>[];
  getRowKey: (row: TData, index: number) => string;
}

export const DataTableContext = createContext<DataTableContextValue | null>(
  null,
);

export function useDataTableContext<
  TData = unknown,
>(): DataTableContextValue<TData> {
  const ctx = useContext(DataTableContext);
  if (!ctx) {
    throw new Error(
      "useDataTableContext must be used within a <DataTable /> component.",
    );
  }
  return ctx as DataTableContextValue<TData>;
}
