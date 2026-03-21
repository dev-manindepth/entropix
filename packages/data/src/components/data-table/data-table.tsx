import React, { useMemo } from "react";
import { useTable } from "@entropix/core";
import type { UseTableOptions, ColumnDef, AccessibilityProps } from "@entropix/core";
import { DataTableContext, type DataTableContextValue } from "./data-table-context.js";
import "../../styles/data-table.css";

// Simple ARIA mapping utility (inline to avoid depending on @entropix/react)
function mapA11yToAria(
  a: AccessibilityProps,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (a.role) result.role = a.role;
  if (a.label) result["aria-label"] = a.label;
  if (a.labelledBy) result["aria-labelledby"] = a.labelledBy;
  if (a.describedBy) result["aria-describedby"] = a.describedBy;
  if (a.disabled != null) result["aria-disabled"] = a.disabled;
  if (a.expanded != null) result["aria-expanded"] = a.expanded;
  if (a.selected != null) result["aria-selected"] = a.selected;
  if (a.checked != null) result["aria-checked"] = a.checked;
  if (a.busy != null) result["aria-busy"] = a.busy;
  if (a.hidden != null) result["aria-hidden"] = a.hidden;
  if (a.tabIndex != null) result.tabIndex = a.tabIndex;
  if (a.controls) result["aria-controls"] = a.controls;
  if (a.orientation) result["aria-orientation"] = a.orientation;
  if (a.required != null) result["aria-required"] = a.required;
  if (a.invalid != null) result["aria-invalid"] = a.invalid;
  return result;
}

export interface DataTableProps<TData = unknown>
  extends UseTableOptions<TData> {
  className?: string;
  emptyMessage?: string;
  renderCell?: (
    value: unknown,
    row: TData,
    column: ColumnDef<TData>,
  ) => React.ReactNode;
}

export function DataTable<TData = unknown>(props: DataTableProps<TData>) {
  const {
    className,
    emptyMessage = "No data",
    renderCell,
    stickyHeader = false,
    ...tableOptions
  } = props;

  const table = useTable<TData>(tableOptions);
  const {
    columns,
    getRowKey = (_, i) => String(i),
    selectionMode = "none",
  } = tableOptions;

  const contextValue = useMemo(
    () =>
      ({
        ...table,
        columns,
        getRowKey,
      }) as DataTableContextValue,
    [table, columns, getRowKey],
  );

  const tableAriaProps = mapA11yToAria(table.getTableProps().accessibility);

  // Get sort direction for a column
  const getSortDir = (colKey: string): "asc" | "desc" | "none" => {
    const s = table.sortState.find((st) => st.columnKey === colKey);
    return s ? s.direction : "none";
  };

  // Check if any column is filterable
  const hasFilters = columns.some((c) => c.filterable);

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className={`entropix-datatable ${className ?? ""}`.trim()}>
        <table className="entropix-datatable__table" {...tableAriaProps}>
          <thead
            className="entropix-datatable__thead"
            data-sticky={stickyHeader ? "true" : undefined}
            {...mapA11yToAria(table.getHeaderRowProps().accessibility)}
          >
            {/* Filter row */}
            {hasFilters && (
              <tr className="entropix-datatable__filter-row">
                {selectionMode !== "none" && (
                  <th className="entropix-datatable__th entropix-datatable__th--checkbox" />
                )}
                {columns.map((col) => (
                  <th
                    key={`filter-${col.key}`}
                    className="entropix-datatable__th entropix-datatable__th--filter"
                  >
                    {col.filterable ? (
                      <input
                        type="text"
                        className="entropix-datatable__filter"
                        placeholder={`Filter ${col.header}...`}
                        value={table.columnFilters[col.key] ?? ""}
                        onChange={(e) =>
                          table.setColumnFilter(col.key, e.target.value)
                        }
                        aria-label={`Filter by ${col.header}`}
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            )}
            {/* Header row */}
            <tr className="entropix-datatable__tr entropix-datatable__tr--header">
              {selectionMode !== "none" && (
                <th className="entropix-datatable__th entropix-datatable__th--checkbox">
                  {selectionMode === "multi" && (
                    <input
                      type="checkbox"
                      className="entropix-datatable__checkbox"
                      checked={table.isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = table.isIndeterminate;
                      }}
                      onChange={table.toggleAllSelection}
                      aria-label="Select all rows"
                    />
                  )}
                </th>
              )}
              {columns.map((col) => {
                const headerProps = table.getHeaderCellProps(col.key);
                const ariaProps = mapA11yToAria(headerProps.accessibility);
                const sortDir = getSortDir(col.key);
                return (
                  <th
                    key={col.key}
                    className={`entropix-datatable__th${col.sortable ? " entropix-datatable__th--sortable" : ""}`}
                    data-sort={col.sortable ? sortDir : undefined}
                    onClick={headerProps.onAction}
                    onKeyDown={
                      col.sortable
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              headerProps.onAction?.();
                            }
                          }
                        : undefined
                    }
                    style={
                      col.width
                        ? {
                            width:
                              typeof col.width === "number"
                                ? `${col.width}px`
                                : col.width,
                          }
                        : undefined
                    }
                    {...ariaProps}
                  >
                    <span className="entropix-datatable__th-content">
                      {col.header}
                      {col.sortable && sortDir !== "none" && (
                        <span
                          className="entropix-datatable__sort-icon"
                          aria-hidden="true"
                        >
                          {sortDir === "asc" ? " \u25B2" : " \u25BC"}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody
            className="entropix-datatable__tbody"
            {...mapA11yToAria(table.getBodyProps().accessibility)}
          >
            {table.isLoading ? (
              <tr className="entropix-datatable__tr entropix-datatable__tr--loading">
                <td
                  className="entropix-datatable__td entropix-datatable__td--loading"
                  colSpan={
                    columns.length + (selectionMode !== "none" ? 1 : 0)
                  }
                >
                  <div className="entropix-datatable__loading">Loading...</div>
                </td>
              </tr>
            ) : table.rows.length === 0 ? (
              <tr className="entropix-datatable__tr entropix-datatable__tr--empty">
                <td
                  className="entropix-datatable__td entropix-datatable__td--empty"
                  colSpan={
                    columns.length + (selectionMode !== "none" ? 1 : 0)
                  }
                >
                  <div className="entropix-datatable__empty">
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              table.rows.map((row, i) => {
                const globalIndex = table.page * table.pageSize + i;
                const rowKey = getRowKey(row, globalIndex);
                const rowProps = table.getRowProps(rowKey, i);
                const isSelected = table.selectedKeys.has(rowKey);
                return (
                  <tr
                    key={rowKey}
                    className="entropix-datatable__tr"
                    data-selected={isSelected ? "true" : undefined}
                    {...mapA11yToAria(rowProps.accessibility)}
                  >
                    {selectionMode !== "none" && (
                      <td className="entropix-datatable__td entropix-datatable__td--checkbox">
                        <input
                          type="checkbox"
                          className="entropix-datatable__checkbox"
                          checked={isSelected}
                          onChange={() => table.toggleRowSelection(rowKey)}
                          aria-label={`Select row ${rowKey}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const cellValue = col.accessor
                        ? col.accessor(row)
                        : (row as Record<string, unknown>)[col.key];
                      return (
                        <td
                          key={col.key}
                          className="entropix-datatable__td"
                          {...mapA11yToAria(
                            table.getCellProps(col.key, rowKey).accessibility,
                          )}
                        >
                          {renderCell
                            ? renderCell(cellValue, row, col)
                            : String(cellValue ?? "")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {table.pageCount > 1 && (
          <nav
            className="entropix-datatable__pagination"
            aria-label="Table pagination"
          >
            <button
              className="entropix-datatable__pagination-btn"
              onClick={table.firstPage}
              disabled={!table.canPreviousPage}
              aria-label="First page"
            >
              {"\u27E8\u27E8"}
            </button>
            <button
              className="entropix-datatable__pagination-btn"
              onClick={table.previousPage}
              disabled={!table.canPreviousPage}
              aria-label="Previous page"
            >
              {"\u27E8"}
            </button>
            <span className="entropix-datatable__pagination-info">
              Page {table.page + 1} of {table.pageCount}
            </span>
            <button
              className="entropix-datatable__pagination-btn"
              onClick={table.nextPage}
              disabled={!table.canNextPage}
              aria-label="Next page"
            >
              {"\u27E9"}
            </button>
            <button
              className="entropix-datatable__pagination-btn"
              onClick={table.lastPage}
              disabled={!table.canNextPage}
              aria-label="Last page"
            >
              {"\u27E9\u27E9"}
            </button>
          </nav>
        )}
      </div>
    </DataTableContext.Provider>
  );
}
