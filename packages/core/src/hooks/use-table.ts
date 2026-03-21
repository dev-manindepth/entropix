import { useCallback, useMemo, useRef, useEffect } from "react";
import { useControllableState } from "./use-controllable-state.js";
import { createKeyboardHandler } from "../utils/create-keyboard-handler.js";
import type { PropGetterReturn } from "../types/prop-getters.js";
import type { InteractionKeyMap } from "../types/interactions.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc";

export interface SortState {
  columnKey: string;
  direction: SortDirection;
}

export interface ColumnDef<TData = unknown> {
  /** Unique key — used as data property name by default */
  key: string;
  /** Display header text */
  header: string;
  /** Custom cell value accessor. Defaults to (row) => row[key] */
  accessor?: (row: TData) => unknown;
  /** Whether this column is sortable. Default: false */
  sortable?: boolean;
  /** Whether this column is filterable. Default: false */
  filterable?: boolean;
  /** Custom sort comparator */
  sortFn?: (a: unknown, b: unknown) => number;
  /** Custom filter predicate */
  filterFn?: (cellValue: unknown, filterValue: string) => boolean;
  /** Column width hint (CSS value for web, number for RN) */
  width?: string | number;
}

export interface UseTableOptions<TData = unknown> {
  /** The raw data array */
  data: TData[];
  /** Column definitions */
  columns: ColumnDef<TData>[];

  // --- Sorting ---
  sortState?: SortState[];
  defaultSortState?: SortState[];
  onSortChange?: (state: SortState[]) => void;
  /** Allow multi-column sort. Default: false */
  multiSort?: boolean;

  // --- Pagination ---
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (size: number) => void;

  // --- Selection ---
  /** Selection mode. Default: "none" */
  selectionMode?: "none" | "single" | "multi";
  selectedKeys?: Set<string>;
  defaultSelectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  /** Function to derive a unique key from a row. Default: (_, index) => String(index) */
  getRowKey?: (row: TData, index: number) => string;

  // --- Filtering ---
  columnFilters?: Record<string, string>;
  defaultColumnFilters?: Record<string, string>;
  onColumnFiltersChange?: (filters: Record<string, string>) => void;

  // --- States ---
  loading?: boolean;
  disabled?: boolean;
  /** Enable sticky header. Default: false */
  stickyHeader?: boolean;
}

export interface UseTableReturn<TData = unknown> {
  // --- Derived data ---
  rows: TData[];
  totalFilteredRows: number;
  pageCount: number;

  // --- Sort ---
  sortState: SortState[];
  toggleSort: (columnKey: string) => void;
  clearSort: () => void;

  // --- Pagination ---
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;

  // --- Selection ---
  selectedKeys: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  toggleRowSelection: (key: string) => void;
  toggleAllSelection: () => void;
  clearSelection: () => void;

  // --- Filters ---
  columnFilters: Record<string, string>;
  setColumnFilter: (columnKey: string, value: string) => void;
  clearColumnFilters: () => void;

  // --- States ---
  isLoading: boolean;
  isDisabled: boolean;

  // --- Prop getters ---
  getTableProps: () => PropGetterReturn;
  getHeaderRowProps: () => PropGetterReturn;
  getHeaderCellProps: (columnKey: string) => PropGetterReturn;
  getBodyProps: () => PropGetterReturn;
  getRowProps: (rowKey: string, rowIndex: number) => PropGetterReturn;
  getCellProps: (columnKey: string, rowKey: string) => PropGetterReturn;
  getSelectAllProps: () => PropGetterReturn;
  getSelectRowProps: (rowKey: string) => PropGetterReturn;
}

// ─── Key maps ────────────────────────────────────────────────────────────────

const TABLE_HEADER_KEY_MAP: InteractionKeyMap = {
  Enter: "activate",
  " ": "activate",
};

const TABLE_BODY_KEY_MAP: InteractionKeyMap = {
  ArrowUp: "moveUp",
  ArrowDown: "moveDown",
  " ": "selectRow",
  Enter: "activate",
};

// ─── Utilities ───────────────────────────────────────────────────────────────

function defaultComparator(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b));
}

function defaultFilterFn(cellValue: unknown, filterValue: string): boolean {
  if (filterValue === "") return true;
  return String(cellValue ?? "")
    .toLowerCase()
    .includes(filterValue.toLowerCase());
}

function getCellValue<TData>(
  row: TData,
  column: ColumnDef<TData>,
): unknown {
  if (column.accessor) return column.accessor(row);
  return (row as Record<string, unknown>)[column.key];
}

const defaultGetRowKey = (_row: unknown, index: number): string =>
  String(index);

const EMPTY_SET = new Set<string>();
const EMPTY_SORT: SortState[] = [];
const EMPTY_FILTERS: Record<string, string> = {};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTable<TData = unknown>(
  options: UseTableOptions<TData>,
): UseTableReturn<TData> {
  const {
    data,
    columns,
    multiSort = false,
    selectionMode = "none",
    getRowKey = defaultGetRowKey as (row: TData, index: number) => string,
    loading = false,
    disabled = false,
  } = options;

  // ─── Controllable states ─────────────────────────────────────────────

  const [sortState, setSortState] = useControllableState<SortState[]>({
    value: options.sortState,
    defaultValue: options.defaultSortState ?? EMPTY_SORT,
    onChange: options.onSortChange,
  });

  const [page, setPageRaw] = useControllableState<number>({
    value: options.page,
    defaultValue: options.defaultPage ?? 0,
    onChange: options.onPageChange,
  });

  const [pageSize, setPageSize] = useControllableState<number>({
    value: options.pageSize,
    defaultValue: options.defaultPageSize ?? 10,
    onChange: options.onPageSizeChange,
  });

  const [selectedKeys, setSelectedKeys] = useControllableState<Set<string>>({
    value: options.selectedKeys,
    defaultValue: options.defaultSelectedKeys ?? EMPTY_SET,
    onChange: options.onSelectionChange,
  });

  const [columnFilters, setColumnFilters] = useControllableState<
    Record<string, string>
  >({
    value: options.columnFilters,
    defaultValue: options.defaultColumnFilters ?? EMPTY_FILTERS,
    onChange: options.onColumnFiltersChange,
  });

  // ─── Data pipeline: filter → sort → paginate ─────────────────────────

  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const filteredData = useMemo(() => {
    const activeFilters = Object.entries(columnFilters).filter(
      ([, val]) => val !== "",
    );
    if (activeFilters.length === 0) return data;

    return data.filter((row) =>
      activeFilters.every(([colKey, filterValue]) => {
        const col = columnsRef.current.find((c) => c.key === colKey);
        if (!col) return true;
        const cellValue = getCellValue(row, col);
        const fn = col.filterFn ?? defaultFilterFn;
        return fn(cellValue, filterValue);
      }),
    );
  }, [data, columnFilters]);

  const sortedData = useMemo(() => {
    if (sortState.length === 0) return filteredData;

    return [...filteredData].sort((a, b) => {
      for (const { columnKey, direction } of sortState) {
        const col = columnsRef.current.find((c) => c.key === columnKey);
        if (!col) continue;
        const aVal = getCellValue(a, col);
        const bVal = getCellValue(b, col);
        const cmp = (col.sortFn ?? defaultComparator)(aVal, bVal);
        if (cmp !== 0) return direction === "asc" ? cmp : -cmp;
      }
      return 0;
    });
  }, [filteredData, sortState]);

  const totalFilteredRows = sortedData.length;
  const pageCount = Math.max(1, Math.ceil(totalFilteredRows / pageSize));

  // Auto-reset page when filters change and current page is out of range
  const prevFilteredCountRef = useRef(totalFilteredRows);
  useEffect(() => {
    if (
      prevFilteredCountRef.current !== totalFilteredRows &&
      page >= pageCount
    ) {
      setPageRaw(0);
    }
    prevFilteredCountRef.current = totalFilteredRows;
  }, [totalFilteredRows, page, pageCount, setPageRaw]);

  const rows = useMemo(() => {
    const start = page * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  // ─── Sort actions ────────────────────────────────────────────────────

  const toggleSort = useCallback(
    (columnKey: string) => {
      setSortState((prev) => {
        const existing = prev.find((s) => s.columnKey === columnKey);
        if (!existing) {
          const newEntry: SortState = { columnKey, direction: "asc" };
          return multiSort ? [...prev, newEntry] : [newEntry];
        }
        if (existing.direction === "asc") {
          const updated = { columnKey, direction: "desc" as SortDirection };
          return multiSort
            ? prev.map((s) => (s.columnKey === columnKey ? updated : s))
            : [updated];
        }
        // desc → remove (cycle back to none)
        const filtered = prev.filter((s) => s.columnKey !== columnKey);
        return filtered;
      });
    },
    [multiSort, setSortState],
  );

  const clearSort = useCallback(() => {
    setSortState([]);
  }, [setSortState]);

  // ─── Pagination actions ──────────────────────────────────────────────

  const setPage = useCallback(
    (p: number) => {
      setPageRaw(Math.max(0, Math.min(p, pageCount - 1)));
    },
    [setPageRaw, pageCount],
  );

  const canPreviousPage = page > 0;
  const canNextPage = page < pageCount - 1;

  const nextPage = useCallback(() => {
    if (canNextPage) setPage(page + 1);
  }, [canNextPage, page, setPage]);

  const previousPage = useCallback(() => {
    if (canPreviousPage) setPage(page - 1);
  }, [canPreviousPage, page, setPage]);

  const firstPage = useCallback(() => setPage(0), [setPage]);
  const lastPage = useCallback(
    () => setPage(pageCount - 1),
    [setPage, pageCount],
  );

  // ─── Selection actions ───────────────────────────────────────────────

  // Build all keys for filtered data (for select-all)
  const allFilteredKeys = useMemo(() => {
    return new Set(sortedData.map((row, i) => getRowKey(row, i)));
  }, [sortedData, getRowKey]);

  const isAllSelected =
    selectionMode !== "none" &&
    allFilteredKeys.size > 0 &&
    selectedKeys.size >= allFilteredKeys.size &&
    [...allFilteredKeys].every((k) => selectedKeys.has(k));

  const isIndeterminate =
    selectionMode !== "none" &&
    selectedKeys.size > 0 &&
    !isAllSelected;

  const toggleRowSelection = useCallback(
    (key: string) => {
      if (selectionMode === "none") return;
      setSelectedKeys((prev) => {
        if (selectionMode === "single") {
          return prev.has(key) ? new Set() : new Set([key]);
        }
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [selectionMode, setSelectedKeys],
  );

  const toggleAllSelection = useCallback(() => {
    if (selectionMode !== "multi") return;
    if (isAllSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(allFilteredKeys));
    }
  }, [selectionMode, isAllSelected, allFilteredKeys, setSelectedKeys]);

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, [setSelectedKeys]);

  // ─── Filter actions ──────────────────────────────────────────────────

  const setColumnFilter = useCallback(
    (columnKey: string, value: string) => {
      setColumnFilters((prev) => {
        const next = { ...prev };
        if (value === "") {
          delete next[columnKey];
        } else {
          next[columnKey] = value;
        }
        return next;
      });
      setPageRaw(0);
    },
    [setColumnFilters, setPageRaw],
  );

  const clearColumnFilters = useCallback(() => {
    setColumnFilters({});
    setPageRaw(0);
  }, [setColumnFilters, setPageRaw]);

  // ─── Keyboard configs ────────────────────────────────────────────────

  const headerKeyboardConfig = useMemo(
    () => createKeyboardHandler(TABLE_HEADER_KEY_MAP),
    [],
  );

  const bodyKeyboardConfig = useMemo(
    () => createKeyboardHandler(TABLE_BODY_KEY_MAP),
    [],
  );

  // ─── Prop getters ────────────────────────────────────────────────────

  const getTableProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: "grid",
        disabled: disabled || undefined,
        busy: loading || undefined,
      },
    };
  }, [disabled, loading]);

  const getHeaderRowProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: "row",
      },
    };
  }, []);

  const getHeaderCellProps = useCallback(
    (columnKey: string): PropGetterReturn => {
      const col = columns.find((c) => c.key === columnKey);
      const _sort = sortState.find((s) => s.columnKey === columnKey);
      const isSortable = col?.sortable ?? false;

      return {
        accessibility: {
          role: "columnheader",
          ...(isSortable
            ? {
                tabIndex: 0,
              }
            : {}),
        },
        keyboardConfig: isSortable && !disabled ? headerKeyboardConfig : undefined,
        onAction: isSortable && !disabled ? () => toggleSort(columnKey) : undefined,
      };
    },
    [columns, sortState, disabled, headerKeyboardConfig, toggleSort],
  );

  const getBodyProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: "rowgroup",
      },
    };
  }, []);

  const getRowProps = useCallback(
    (rowKey: string, _rowIndex: number): PropGetterReturn => {
      const isSelected = selectedKeys.has(rowKey);
      return {
        accessibility: {
          role: "row",
          selected: selectionMode !== "none" ? isSelected : undefined,
        },
        keyboardConfig:
          selectionMode !== "none" && !disabled
            ? bodyKeyboardConfig
            : undefined,
        onAction:
          selectionMode !== "none" && !disabled
            ? () => toggleRowSelection(rowKey)
            : undefined,
      };
    },
    [selectedKeys, selectionMode, disabled, bodyKeyboardConfig, toggleRowSelection],
  );

  const getCellProps = useCallback(
    (_columnKey: string, _rowKey: string): PropGetterReturn => {
      return {
        accessibility: {
          role: "gridcell",
        },
      };
    },
    [],
  );

  const getSelectAllProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: "checkbox",
        checked: isAllSelected ? true : isIndeterminate ? "mixed" : false,
        disabled: disabled || undefined,
        label: "Select all rows",
      },
      onAction: disabled ? undefined : toggleAllSelection,
    };
  }, [isAllSelected, isIndeterminate, disabled, toggleAllSelection]);

  const getSelectRowProps = useCallback(
    (rowKey: string): PropGetterReturn => {
      const isSelected = selectedKeys.has(rowKey);
      return {
        accessibility: {
          role: "checkbox",
          checked: isSelected,
          disabled: disabled || undefined,
          label: `Select row ${rowKey}`,
        },
        onAction: disabled ? undefined : () => toggleRowSelection(rowKey),
      };
    },
    [selectedKeys, disabled, toggleRowSelection],
  );

  // ─── Return ──────────────────────────────────────────────────────────

  return {
    rows,
    totalFilteredRows,
    pageCount,

    sortState,
    toggleSort,
    clearSort,

    page,
    pageSize,
    setPage,
    setPageSize,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,

    selectedKeys,
    isAllSelected,
    isIndeterminate,
    toggleRowSelection,
    toggleAllSelection,
    clearSelection,

    columnFilters,
    setColumnFilter,
    clearColumnFilters,

    isLoading: loading,
    isDisabled: disabled,

    getTableProps,
    getHeaderRowProps,
    getHeaderCellProps,
    getBodyProps,
    getRowProps,
    getCellProps,
    getSelectAllProps,
    getSelectRowProps,
  };
}
