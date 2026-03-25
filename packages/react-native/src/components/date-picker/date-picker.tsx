import React from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import {
  useDatePicker,
  type UseDatePickerOptions,
  isSameDay,
  type CalendarDay,
} from "@entropix/core";
import { useTheme } from "../../theme/theme-context.js";
import { useLocale } from "../../i18n/i18n-context.js";

export interface DatePickerProps extends UseDatePickerOptions {
  /** Label text displayed above the input */
  label?: string;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Override wrapper View style */
  style?: StyleProp<ViewStyle>;
  /** Override label text style */
  labelStyle?: TextStyle;
  /** Override trigger text style */
  textStyle?: TextStyle;
  /** testID for testing */
  testID?: string;
}

/**
 * DatePicker — input-like trigger with a Modal calendar.
 *
 * Shows formatted date in the trigger. Opens a Modal with a
 * Calendar on press. Selecting a date closes the Modal and
 * updates the display.
 */
export function DatePicker({
  label,
  placeholder,
  style,
  labelStyle,
  textStyle,
  testID,
  ...options
}: DatePickerProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const locale = useLocale();
  const datePicker = useDatePicker(options);

  const {
    displayValue,
    isCalendarOpen,
    openCalendar,
    closeCalendar,
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
    <View style={[{ gap: bt.entropixSpacing1 as number }, style]} testID={testID}>
      {label ? (
        <Text
          style={[
            {
              fontSize: bt.entropixFontSizeSm as number,
              fontWeight: "500",
              color: t.entropixColorTextPrimary as string,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      ) : null}

      {/* Trigger: input-like Pressable */}
      <Pressable
        onPress={openCalendar}
        accessibilityRole="button"
        accessibilityLabel={label ?? locale.datePicker_label}
        accessibilityState={{ expanded: isCalendarOpen }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: t.entropixColorBorderDefault as string,
          borderRadius: bt.entropixRadiusMd as number,
          paddingVertical: bt.entropixSpacing2 as number,
          paddingHorizontal: bt.entropixSpacing3 as number,
          backgroundColor: t.entropixColorBgPrimary as string,
          minHeight: 44,
        }}
      >
        <Text
          style={[
            {
              flex: 1,
              fontSize: bt.entropixFontSizeBase as number,
              color: displayValue
                ? (t.entropixColorTextPrimary as string)
                : (t.entropixColorTextTertiary as string),
            },
            textStyle,
          ]}
        >
          {displayValue || placeholder || locale.datePicker_placeholder}
        </Text>
        <Text
          style={{
            fontSize: bt.entropixFontSizeBase as number,
            color: t.entropixColorTextTertiary as string,
          }}
        >
          {"\uD83D\uDCC5"}
        </Text>
      </Pressable>

      {/* Modal calendar */}
      <Modal
        visible={isCalendarOpen}
        transparent
        animationType="fade"
        onRequestClose={closeCalendar}
        supportedOrientations={["portrait", "landscape"]}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          onPress={closeCalendar}
        >
          <View
            style={{
              backgroundColor: t.entropixColorBgPrimary as string,
              borderRadius: bt.entropixRadiusLg as number,
              padding: bt.entropixSpacing4 as number,
              width: "90%",
              maxWidth: 360,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
            onStartShouldSetResponder={() => true}
          >
            {/* Calendar header */}
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
              <View key={weekIndex} style={{ flexDirection: "row" }}>
                {week.map((day, dayIndex) => {
                  const isSelected =
                    selectedDate !== null && isSameDay(day.date, selectedDate);
                  const isCurrentDay = isSameDay(day.date, today);

                  return (
                    <ModalDayCell
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
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Internal day cell for the modal calendar ───────────────────────────────

interface ModalDayCellProps {
  day: CalendarDay;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
}

function ModalDayCell({ day, isSelected, isToday, onPress }: ModalDayCellProps) {
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
