import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
  type ListRenderItemInfo,
} from "react-native";
import {
  useTable,
  type UseTableOptions,
  type ColumnDef,
  type SortState,
} from "@entropix/core";
import { useTheme } from "@entropix/react-native";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { DataTableProvider, type DataTableContextValue } from "./data-table-context.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DataTableProps<TData = unknown>
  extends UseTableOptions<TData> {
  /** Override wrapper View style */
  style?: StyleProp<ViewStyle>;
  /** Message to display when the table has no rows */
  emptyMessage?: string;
  /** Custom cell renderer. Receives column def, cell value, row data, and row index */
  renderCell?: (
    column: ColumnDef<TData>,
    value: unknown,
    row: TData,
    rowIndex: number,
  ) => React.ReactNode;
  /** Override tokens (bypasses EntropixProvider) */
  tokens?: Record<string, unknown>;
  /** testID for testing */
  testID?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const defaultGetRowKey = (_row: unknown, index: number): string =>
  String(index);

function getCellValue<TData>(row: TData, column: ColumnDef<TData>): unknown {
  if (column.accessor) return column.accessor(row);
  return (row as Record<string, unknown>)[column.key];
}

function getSortIndicator(
  columnKey: string,
  sortState: SortState[],
): string | null {
  const sort = sortState.find((s) => s.columnKey === columnKey);
  if (!sort) return null;
  return sort.direction === "asc" ? "\u25B2" : "\u25BC";
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * DataTable -- A full-featured data table for React Native.
 *
 * Features:
 * - Column sorting with visual indicators
 * - Per-column text filtering
 * - Pagination with first/prev/next/last controls
 * - Row selection (single or multi) with checkbox UI
 * - Loading and empty states
 * - Accessible via mapAccessibilityToRN
 *
 * ```tsx
 * <DataTable
 *   data={users}
 *   columns={[
 *     { key: "name", header: "Name", sortable: true, filterable: true },
 *     { key: "email", header: "Email" },
 *   ]}
 *   selectionMode="multi"
 *   getRowKey={(row) => row.id}
 * />
 * ```
 */
export function DataTable<TData = unknown>({
  style,
  emptyMessage = "No data available",
  renderCell,
  tokens: tokenOverrides,
  testID,
  ...options
}: DataTableProps<TData>) {
  const table = useTable(options);
  const {
    columns,
    getRowKey = defaultGetRowKey as (row: TData, index: number) => string,
    selectionMode = "none",
  } = options;

  // Use theme context tokens (respects brand + dark mode)
  const theme = useTheme();
  const bt = useMemo(
    () => (tokenOverrides ? { ...theme.baseTokens, ...tokenOverrides } : theme.baseTokens),
    [theme.baseTokens, tokenOverrides],
  );
  const st = useMemo(
    () => (tokenOverrides ? { ...theme.tokens, ...tokenOverrides } : theme.tokens),
    [theme.tokens, tokenOverrides],
  );

  // Check if any column is filterable
  const hasFilterableColumns = columns.some((col) => col.filterable);

  // Calculate minimum column width to fill the container
  // Each column gets at least 120px, or its explicit width
  const MIN_COL_WIDTH = 120;
  const checkboxColWidth = selectionMode !== "none" ? 44 : 0;
  const totalMinWidth = columns.reduce(
    (sum, col) => sum + (typeof col.width === "number" ? col.width : MIN_COL_WIDTH),
    checkboxColWidth,
  );

  // Table accessibility props
  const tableA11y = mapAccessibilityToRN(table.getTableProps().accessibility);

  // ─── Checkbox component ──────────────────────────────────────────────

  const Checkbox = useCallback(
    ({
      checked,
      indeterminate,
      onPress,
      label,
    }: {
      checked: boolean;
      indeterminate?: boolean;
      onPress: () => void;
      label: string;
    }) => {
      const a11y = mapAccessibilityToRN({
        role: "checkbox",
        checked: indeterminate ? "mixed" : checked,
        label,
      });

      return (
        <Pressable
          onPress={onPress}
          style={{
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: checked || indeterminate
              ? (st.entropixColorBorderFocus as string)
              : (st.entropixColorBorderDefault as string),
            borderRadius: bt.entropixRadiusSm as number,
            backgroundColor: checked || indeterminate
              ? (st.entropixColorBorderFocus as string)
              : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
          {...a11y}
        >
          {checked && (
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: "700",
                lineHeight: 14,
              }}
            >
              {"\u2713"}
            </Text>
          )}
          {indeterminate && !checked && (
            <View
              style={{
                width: 10,
                height: 2,
                backgroundColor: "#FFFFFF",
                borderRadius: 1,
              }}
            />
          )}
        </Pressable>
      );
    },
    [bt, st],
  );

  // ─── Filter row ──────────────────────────────────────────────────────

  const renderFilterRow = () => {
    if (!hasFilterableColumns) return null;

    return (
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: bt.entropixSpacing2 as number,
          paddingVertical: bt.entropixSpacing1 as number,
          gap: bt.entropixSpacing1 as number,
          backgroundColor: st.entropixColorSurfaceDefault as string,
          borderBottomWidth: 1,
          borderBottomColor: st.entropixColorBorderDefault as string,
        }}
      >
        {selectionMode !== "none" && (
          <View style={{ width: 44 }} />
        )}
        {columns.map((col) => (
          <View
            key={`filter-${col.key}`}
            style={{
              minWidth: typeof col.width === "number" ? col.width : MIN_COL_WIDTH,
              flex: 1,
            }}
          >
            {col.filterable ? (
              <TextInput
                style={{
                  height: 32,
                  borderWidth: 1,
                  borderColor: st.entropixColorBorderDefault as string,
                  borderRadius: bt.entropixRadiusSm as number,
                  paddingHorizontal: bt.entropixSpacing1 as number,
                  fontSize: bt.entropixFontSizeXs as number,
                  color: st.entropixColorTextPrimary as string,
                  backgroundColor: st.entropixColorSurfaceDefault as string,
                }}
                placeholder={`Filter ${col.header}...`}
                placeholderTextColor={st.entropixColorTextDisabled as string}
                value={table.columnFilters[col.key] ?? ""}
                onChangeText={(text) => table.setColumnFilter(col.key, text)}
                accessibilityLabel={`Filter by ${col.header}`}
              />
            ) : null}
          </View>
        ))}
      </View>
    );
  };

  // ─── Header row ──────────────────────────────────────────────────────

  const renderHeader = () => {
    const headerRowA11y = mapAccessibilityToRN(
      table.getHeaderRowProps().accessibility,
    );

    return (
      <View
        style={{
          flexDirection: "row",
          backgroundColor: st.entropixColorSurfaceSubtle as string,
          borderBottomWidth: 2,
          borderBottomColor: st.entropixColorBorderDefault as string,
          paddingVertical: bt.entropixSpacing2 as number,
          paddingHorizontal: bt.entropixSpacing2 as number,
        }}
        {...headerRowA11y}
      >
        {selectionMode !== "none" && (
          <View
            style={{
              width: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selectionMode === "multi" && (
              <Checkbox
                checked={table.isAllSelected}
                indeterminate={table.isIndeterminate}
                onPress={table.toggleAllSelection}
                label="Select all rows"
              />
            )}
          </View>
        )}
        {columns.map((col) => {
          const headerCellProps = table.getHeaderCellProps(col.key);
          const headerCellA11y = mapAccessibilityToRN(
            headerCellProps.accessibility,
          );
          const sortIndicator = getSortIndicator(col.key, table.sortState);

          return (
            <Pressable
              key={col.key}
              style={{
                minWidth: typeof col.width === "number" ? col.width : MIN_COL_WIDTH,
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: bt.entropixSpacing1 as number,
              }}
              onPress={
                col.sortable && !table.isDisabled
                  ? () => table.toggleSort(col.key)
                  : undefined
              }
              disabled={!col.sortable || table.isDisabled}
              {...headerCellA11y}
            >
              <Text
                style={{
                  fontSize: bt.entropixFontSizeSm as number,
                  fontWeight: "600",
                  color: st.entropixColorTextPrimary as string,
                }}
              >
                {col.header}
              </Text>
              {col.sortable && (
                <Text
                  style={{
                    fontSize: bt.entropixFontSizeXs as number,
                    color: sortIndicator
                      ? (st.entropixColorTextPrimary as string)
                      : (st.entropixColorTextDisabled as string),
                  }}
                >
                  {sortIndicator ?? "\u25B2"}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  };

  // ─── Row rendering ───────────────────────────────────────────────────

  const renderRow = useCallback(
    ({ item, index }: ListRenderItemInfo<TData>) => {
      const rowKey = getRowKey(item, index);
      const rowProps = table.getRowProps(rowKey, index);
      const rowA11y = mapAccessibilityToRN(rowProps.accessibility);
      const isSelected = table.selectedKeys.has(rowKey);

      return (
        <View
          style={{
            flexDirection: "row",
            paddingVertical: bt.entropixSpacing2 as number,
            paddingHorizontal: bt.entropixSpacing2 as number,
            borderBottomWidth: 1,
            borderBottomColor: st.entropixColorBorderDefault as string,
            backgroundColor: isSelected
              ? (st.entropixColorSurfaceSubtle as string)
              : (st.entropixColorSurfaceDefault as string),
          }}
          {...rowA11y}
        >
          {selectionMode !== "none" && (
            <View
              style={{
                width: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Checkbox
                checked={isSelected}
                onPress={() => table.toggleRowSelection(rowKey)}
                label={`Select row ${rowKey}`}
              />
            </View>
          )}
          {columns.map((col) => {
            const cellValue = getCellValue(item, col);
            const cellProps = table.getCellProps(col.key, rowKey);
            const cellA11y = mapAccessibilityToRN(cellProps.accessibility);

            return (
              <View
                key={col.key}
                style={{
                  minWidth: typeof col.width === "number" ? col.width : MIN_COL_WIDTH,
                  flex: 1,
                  justifyContent: "center",
                }}
                {...cellA11y}
              >
                {renderCell ? (
                  renderCell(col, cellValue, item, index)
                ) : (
                  <Text
                    style={{
                      fontSize: bt.entropixFontSizeSm as number,
                      color: st.entropixColorTextPrimary as string,
                    }}
                    numberOfLines={1}
                  >
                    {cellValue != null ? String(cellValue) : ""}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      );
    },
    [bt, st, columns, getRowKey, renderCell, selectionMode, table],
  );

  const keyExtractor = useCallback(
    (item: TData, index: number) => getRowKey(item, index),
    [getRowKey],
  );

  // ─── Pagination controls ─────────────────────────────────────────────

  const renderPagination = () => {
    if (table.pageCount <= 1) return null;

    const buttonStyle = (disabled: boolean): ViewStyle => ({
      paddingHorizontal: bt.entropixSpacing2 as number,
      paddingVertical: bt.entropixSpacing1 as number,
      borderRadius: bt.entropixRadiusSm as number,
      backgroundColor: disabled
        ? (st.entropixColorSurfaceSubtle as string)
        : (st.entropixColorSurfaceDefault as string),
      borderWidth: 1,
      borderColor: disabled
        ? (st.entropixColorBorderDefault as string)
        : (st.entropixColorBorderFocus as string),
      opacity: disabled ? 0.5 : 1,
    });

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: bt.entropixSpacing1 as number,
          paddingVertical: bt.entropixSpacing2 as number,
          paddingHorizontal: bt.entropixSpacing2 as number,
          borderTopWidth: 1,
          borderTopColor: st.entropixColorBorderDefault as string,
        }}
      >
        <Pressable
          onPress={table.firstPage}
          disabled={!table.canPreviousPage}
          style={buttonStyle(!table.canPreviousPage)}
          {...mapAccessibilityToRN({
            role: "button",
            label: "Go to first page",
            disabled: !table.canPreviousPage,
          })}
        >
          <Text
            style={{
              fontSize: bt.entropixFontSizeXs as number,
              color: !table.canPreviousPage
                ? (st.entropixColorTextDisabled as string)
                : (st.entropixColorTextPrimary as string),
            }}
          >
            {"\u00AB"}
          </Text>
        </Pressable>

        <Pressable
          onPress={table.previousPage}
          disabled={!table.canPreviousPage}
          style={buttonStyle(!table.canPreviousPage)}
          {...mapAccessibilityToRN({
            role: "button",
            label: "Go to previous page",
            disabled: !table.canPreviousPage,
          })}
        >
          <Text
            style={{
              fontSize: bt.entropixFontSizeXs as number,
              color: !table.canPreviousPage
                ? (st.entropixColorTextDisabled as string)
                : (st.entropixColorTextPrimary as string),
            }}
          >
            {"\u2039"}
          </Text>
        </Pressable>

        <Text
          style={{
            fontSize: bt.entropixFontSizeSm as number,
            color: st.entropixColorTextPrimary as string,
            paddingHorizontal: bt.entropixSpacing2 as number,
          }}
        >
          {`${table.page + 1} / ${table.pageCount}`}
        </Text>

        <Pressable
          onPress={table.nextPage}
          disabled={!table.canNextPage}
          style={buttonStyle(!table.canNextPage)}
          {...mapAccessibilityToRN({
            role: "button",
            label: "Go to next page",
            disabled: !table.canNextPage,
          })}
        >
          <Text
            style={{
              fontSize: bt.entropixFontSizeXs as number,
              color: !table.canNextPage
                ? (st.entropixColorTextDisabled as string)
                : (st.entropixColorTextPrimary as string),
            }}
          >
            {"\u203A"}
          </Text>
        </Pressable>

        <Pressable
          onPress={table.lastPage}
          disabled={!table.canNextPage}
          style={buttonStyle(!table.canNextPage)}
          {...mapAccessibilityToRN({
            role: "button",
            label: "Go to last page",
            disabled: !table.canNextPage,
          })}
        >
          <Text
            style={{
              fontSize: bt.entropixFontSizeXs as number,
              color: !table.canNextPage
                ? (st.entropixColorTextDisabled as string)
                : (st.entropixColorTextPrimary as string),
            }}
          >
            {"\u00BB"}
          </Text>
        </Pressable>
      </View>
    );
  };

  // ─── Empty state ─────────────────────────────────────────────────────

  const renderEmpty = () => (
    <View
      style={{
        paddingVertical: bt.entropixSpacing8 as number,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: bt.entropixFontSizeSm as number,
          color: st.entropixColorTextDisabled as string,
        }}
      >
        {emptyMessage}
      </Text>
    </View>
  );

  // ─── Loading state ───────────────────────────────────────────────────

  if (table.isLoading) {
    return (
      <View
        testID={testID}
        style={[
          {
            borderWidth: 1,
            borderColor: st.entropixColorBorderDefault as string,
            borderRadius: bt.entropixRadiusMd as number,
            backgroundColor: st.entropixColorSurfaceDefault as string,
            overflow: "hidden",
            paddingVertical: bt.entropixSpacing8 as number,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
        {...tableA11y}
      >
        <ActivityIndicator
          size="large"
          color={st.entropixColorBorderFocus as string}
        />
        <Text
          style={{
            marginTop: bt.entropixSpacing2 as number,
            fontSize: bt.entropixFontSizeSm as number,
            color: st.entropixColorTextDisabled as string,
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────

  return (
    <DataTableProvider value={{ table, columns, getRowKey } as DataTableContextValue}>
      <View
        testID={testID}
        style={[
          {
            borderWidth: 1,
            borderColor: st.entropixColorBorderDefault as string,
            borderRadius: bt.entropixRadiusMd as number,
            backgroundColor: st.entropixColorSurfaceDefault as string,
            overflow: "hidden",
          },
          style,
        ]}
        {...tableA11y}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={{ minWidth: "100%" }}>
            {renderFilterRow()}
            {renderHeader()}

            {table.rows.length === 0 ? (
              renderEmpty()
            ) : (
              <FlatList
                data={table.rows}
                renderItem={renderRow}
                keyExtractor={keyExtractor}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>

        {renderPagination()}
      </View>
    </DataTableProvider>
  );
}
