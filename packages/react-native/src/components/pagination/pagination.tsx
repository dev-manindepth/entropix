import React from "react";
import {
  View,
  Text,
  Pressable,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { usePagination, type UsePaginationOptions } from "@entropix/core";
import { useTheme } from "../../theme/theme-context.js";
import { useLocale } from "../../i18n/i18n-context.js";

export interface PaginationProps extends UsePaginationOptions {
  /** Override container style */
  style?: StyleProp<ViewStyle>;
  /** Override button style */
  buttonStyle?: StyleProp<ViewStyle>;
  /** Override button text style */
  buttonTextStyle?: TextStyle;
  /** testID for testing */
  testID?: string;
}

/**
 * Pagination — horizontal page navigation component.
 *
 * Uses usePagination() from @entropix/core to compute page numbers.
 * Renders first/prev/page numbers/next/last buttons.
 * Active page: primary bg, white text.
 * Disabled buttons: opacity 0.4.
 * Ellipsis rendered as plain Text "...".
 */
export function Pagination({
  style,
  buttonStyle,
  buttonTextStyle,
  testID,
  ...options
}: PaginationProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const locale = useLocale();
  const pagination = usePagination(options);

  const {
    currentPage,
    totalPages,
    pages,
    goToPage,
    nextPage,
    prevPage,
    canGoPrev,
    canGoNext,
  } = pagination;

  const btnSize = 36;

  const baseButtonStyle: ViewStyle = {
    width: btnSize,
    height: btnSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: bt.entropixRadiusMd as number,
    borderWidth: 1,
    borderColor: t.entropixColorBorderDefault as string,
    backgroundColor: t.entropixColorBgPrimary as string,
  };

  const baseTextStyle: TextStyle = {
    fontSize: bt.entropixFontSizeSm as number,
    fontWeight: "500",
    color: t.entropixColorTextPrimary as string,
  };

  const activeButtonStyle: ViewStyle = {
    ...baseButtonStyle,
    backgroundColor: t.entropixColorActionPrimaryDefault as string,
    borderColor: t.entropixColorActionPrimaryDefault as string,
  };

  const activeTextStyle: TextStyle = {
    ...baseTextStyle,
    color: t.entropixColorTextInverse as string,
    fontWeight: "600",
  };

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: bt.entropixSpacing1 as number,
        },
        style,
      ]}
      testID={testID}
      accessibilityRole="none"
      accessibilityLabel={locale.pagination_label}
    >
      {/* First page */}
      <Pressable
        onPress={() => goToPage(1)}
        disabled={!canGoPrev}
        accessibilityRole="button"
        accessibilityLabel={locale.pagination_firstPage}
        style={[
          baseButtonStyle,
          !canGoPrev && { opacity: 0.4 },
          buttonStyle,
        ]}
      >
        <Text style={[baseTextStyle, buttonTextStyle]}>{"\u00AB"}</Text>
      </Pressable>

      {/* Previous page */}
      <Pressable
        onPress={prevPage}
        disabled={!canGoPrev}
        accessibilityRole="button"
        accessibilityLabel={locale.pagination_previousPage}
        style={[
          baseButtonStyle,
          !canGoPrev && { opacity: 0.4 },
          buttonStyle,
        ]}
      >
        <Text style={[baseTextStyle, buttonTextStyle]}>{"\u2039"}</Text>
      </Pressable>

      {/* Page numbers */}
      {pages.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <View
              key={`ellipsis-${index}`}
              style={{
                width: btnSize,
                height: btnSize,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: bt.entropixFontSizeSm as number,
                  color: t.entropixColorTextTertiary as string,
                }}
              >
                {"..."}
              </Text>
            </View>
          );
        }

        const isActive = page === currentPage;

        return (
          <Pressable
            key={page}
            onPress={() => goToPage(page)}
            accessibilityRole="button"
            accessibilityLabel={locale.pagination_pageLabel(page)}
            accessibilityState={{ selected: isActive }}
            style={[
              isActive ? activeButtonStyle : baseButtonStyle,
              buttonStyle,
            ]}
          >
            <Text
              style={[
                isActive ? activeTextStyle : baseTextStyle,
                buttonTextStyle,
              ]}
            >
              {page}
            </Text>
          </Pressable>
        );
      })}

      {/* Next page */}
      <Pressable
        onPress={nextPage}
        disabled={!canGoNext}
        accessibilityRole="button"
        accessibilityLabel={locale.pagination_nextPage}
        style={[
          baseButtonStyle,
          !canGoNext && { opacity: 0.4 },
          buttonStyle,
        ]}
      >
        <Text style={[baseTextStyle, buttonTextStyle]}>{"\u203A"}</Text>
      </Pressable>

      {/* Last page */}
      <Pressable
        onPress={() => goToPage(totalPages)}
        disabled={!canGoNext}
        accessibilityRole="button"
        accessibilityLabel={locale.pagination_lastPage}
        style={[
          baseButtonStyle,
          !canGoNext && { opacity: 0.4 },
          buttonStyle,
        ]}
      >
        <Text style={[baseTextStyle, buttonTextStyle]}>{"\u00BB"}</Text>
      </Pressable>
    </View>
  );
}
