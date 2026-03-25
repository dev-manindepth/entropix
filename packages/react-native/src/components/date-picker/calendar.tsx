import React from "react";
import {
  View,
  Text,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  useDatePicker,
  type UseDatePickerOptions,
  type CalendarDay,
  isSameDay,
} from "@entropix/core";
import { useTheme } from "../../theme/theme-context.js";
import { useLocale } from "../../i18n/i18n-context.js";

export interface CalendarProps extends UseDatePickerOptions {
  /** Override container style */
  style?: StyleProp<ViewStyle>;
  /** testID for testing */
  testID?: string;
}

/**
 * Calendar — standalone calendar grid component.
 *
 * Renders a month/year header with navigation buttons,
 * a day-names row, and a 6x7 grid of selectable day cells.
 * All styling via useTheme() tokens.
 */
export function Calendar({
  style,
  testID,
  ...options
}: CalendarProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const locale = useLocale();
  const datePicker = useDatePicker(options);

  const {
    calendarMonth,
    calendarYear,
    calendarDays,
    selectedDate,
    prevMonth,
    nextMonth,
    selectDate,
  } = datePicker;

  const today = new Date();

  return (
    <View
      style={[
        {
          backgroundColor: t.entropixColorBgPrimary as string,
          borderRadius: bt.entropixRadiusLg as number,
          padding: bt.entropixSpacing4 as number,
        },
        style,
      ]}
      testID={testID}
      accessibilityRole="none"
    >
      {/* Header: prev/next month buttons + month/year text */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: bt.entropixSpacing3 as number,
        }}
      >
        <Pressable
          onPress={prevMonth}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={locale.calendar_previousMonth}
          style={{
            paddingHorizontal: bt.entropixSpacing2 as number,
            paddingVertical: bt.entropixSpacing1 as number,
          }}
        >
          <Text
            style={{
              fontSize: bt.entropixFontSizeLg as number,
              color: t.entropixColorTextPrimary as string,
              fontWeight: "600",
            }}
          >
            {"\u2039"}
          </Text>
        </Pressable>

        <Text
          style={{
            fontSize: bt.entropixFontSizeBase as number,
            fontWeight: "600",
            color: t.entropixColorTextPrimary as string,
          }}
        >
          {locale.calendar_monthNames[calendarMonth]} {calendarYear}
        </Text>

        <Pressable
          onPress={nextMonth}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={locale.calendar_nextMonth}
          style={{
            paddingHorizontal: bt.entropixSpacing2 as number,
            paddingVertical: bt.entropixSpacing1 as number,
          }}
        >
          <Text
            style={{
              fontSize: bt.entropixFontSizeLg as number,
              color: t.entropixColorTextPrimary as string,
              fontWeight: "600",
            }}
          >
            {"\u203A"}
          </Text>
        </Pressable>
      </View>

      {/* Day names row */}
      <View
        style={{
          flexDirection: "row",
          marginBottom: bt.entropixSpacing1 as number,
        }}
      >
        {locale.calendar_dayNames.map((dayName) => (
          <View
            key={dayName}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: bt.entropixSpacing1 as number,
            }}
          >
            <Text
              style={{
                fontSize: bt.entropixFontSizeXs as number,
                fontWeight: "600",
                color: t.entropixColorTextTertiary as string,
              }}
            >
              {dayName}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {calendarDays.map((week, weekIndex) => (
        <View
          key={weekIndex}
          style={{
            flexDirection: "row",
          }}
        >
          {week.map((day, dayIndex) => {
            const isSelected =
              selectedDate !== null && isSameDay(day.date, selectedDate);
            const isCurrentDay = isSameDay(day.date, today);

            return (
              <DayCell
                key={dayIndex}
                day={day}
                isSelected={isSelected}
                isToday={isCurrentDay}
                onPress={() => {
                  if (!day.isDisabled) {
                    selectDate(day.date);
                  }
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ─── Internal day cell ──────────────────────────────────────────────────────

interface DayCellProps {
  day: CalendarDay;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
}

function DayCell({ day, isSelected, isToday, onPress }: DayCellProps) {
  const { tokens: t, baseTokens: bt } = useTheme();

  const cellSize = 36;

  return (
    <Pressable
      onPress={onPress}
      disabled={day.isDisabled}
      accessibilityRole="button"
      accessibilityLabel={day.date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
      accessibilityState={{
        selected: isSelected,
        disabled: day.isDisabled,
      }}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: cellSize,
        opacity: day.isDisabled ? 0.4 : 1,
      }}
    >
      <View
        style={{
          width: cellSize - 4,
          height: cellSize - 4,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: bt.entropixRadiusFull as number,
          backgroundColor: isSelected
            ? (t.entropixColorActionPrimaryDefault as string)
            : "transparent",
          borderWidth: isToday && !isSelected ? 1 : 0,
          borderColor: isToday
            ? (t.entropixColorBorderFocus as string)
            : "transparent",
        }}
      >
        <Text
          style={{
            fontSize: bt.entropixFontSizeSm as number,
            fontWeight: isSelected || isToday ? "600" : "400",
            color: isSelected
              ? (t.entropixColorTextInverse as string)
              : day.isCurrentMonth
                ? (t.entropixColorTextPrimary as string)
                : (t.entropixColorTextTertiary as string),
          }}
        >
          {day.day}
        </Text>
      </View>
    </Pressable>
  );
}
