import { forwardRef, useState, useCallback, useRef, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn.js";
import { useLocale } from "../../i18n/i18n-context.js";
import { Calendar } from "./calendar.js";

export interface DatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Label for the date picker input */
  label?: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Currently selected date (controlled) */
  value?: Date | null;
  /** Callback when a date is selected */
  onChange?: (date: Date | null) => void;
  /** Default selected date (uncontrolled) */
  defaultValue?: Date | null;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Date format string. Default: "MM/DD/YYYY" */
  format?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error message to display below the input */
  errorMessage?: string;
}

function formatDate(date: Date | null, format: string): string {
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());

  return format
    .replace("MM", month)
    .replace("DD", day)
    .replace("YYYY", year);
}

function parseDate(input: string): Date | null {
  // Try common formats: MM/DD/YYYY, YYYY-MM-DD, MM-DD-YYYY
  const patterns = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      let year: number, month: number, day: number;
      if (pattern === patterns[1]) {
        // YYYY-MM-DD
        year = parseInt(match[1]!, 10);
        month = parseInt(match[2]!, 10) - 1;
        day = parseInt(match[3]!, 10);
      } else {
        // MM/DD/YYYY or MM-DD-YYYY
        month = parseInt(match[1]!, 10) - 1;
        day = parseInt(match[2]!, 10);
        year = parseInt(match[3]!, 10);
      }

      const date = new Date(year, month, day);
      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        return date;
      }
    }
  }
  return null;
}

/**
 * DatePicker — input field with calendar dropdown.
 *
 * Click the input to open a Calendar popover. Supports manual text input parsing.
 * SSR-safe via useEffect mount gating for portal rendering.
 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(
    {
      label,
      placeholder,
      value: controlledValue,
      onChange,
      defaultValue = null,
      minDate,
      maxDate,
      format = "MM/DD/YYYY",
      disabled = false,
      errorMessage,
      className,
      ...rest
    },
    ref,
  ) {
    const locale = useLocale();
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<Date | null>(defaultValue);
    const selectedDate = isControlled ? (controlledValue ?? null) : internalValue;

    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState(formatDate(selectedDate, format));
    const [mounted, setMounted] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const baseId = useId();
    const inputId = `${baseId}-date-input`;
    const labelId = `${baseId}-date-label`;
    const errorId = `${baseId}-date-error`;

    useEffect(() => {
      setMounted(true);
    }, []);

    // Sync input text when value changes externally
    useEffect(() => {
      setInputText(formatDate(selectedDate, format));
    }, [selectedDate, format]);

    const setDate = useCallback(
      (date: Date | null) => {
        if (!isControlled) {
          setInternalValue(date);
        }
        onChange?.(date);
        setInputText(formatDate(date, format));
      },
      [isControlled, onChange, format],
    );

    const handleCalendarChange = useCallback(
      (date: Date) => {
        setDate(date);
        setIsOpen(false);
      },
      [setDate],
    );

    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        setInputText(text);

        if (text === "") {
          setDate(null);
          return;
        }

        const parsed = parseDate(text);
        if (parsed) {
          setDate(parsed);
        }
      },
      [setDate],
    );

    const handleInputFocus = useCallback(() => {
      if (!disabled) {
        setIsOpen(true);
      }
    }, [disabled]);

    const handleInputKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        } else if (event.key === "Enter") {
          setIsOpen((prev) => !prev);
        }
      },
      [],
    );

    // Close on outside click
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          containerRef.current &&
          !containerRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Calculate dropdown position
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    useEffect(() => {
      if (!isOpen || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "absolute",
        top: `${rect.bottom + window.scrollY + 4}px`,
        left: `${rect.left + window.scrollX}px`,
        minWidth: `${rect.width}px`,
      });
    }, [isOpen]);

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        {...rest}
        className={cn("entropix-date-picker", className)}
      >
        {label && (
          <label
            id={labelId}
            htmlFor={inputId}
            className="entropix-date-picker__label"
          >
            {label}
          </label>
        )}

        <div className="entropix-date-picker__input-wrapper">
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className={cn(
              "entropix-date-picker__input",
              errorMessage && "entropix-date-picker__input--error",
            )}
            value={inputText}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder ?? locale.datePicker_placeholder}
            disabled={disabled}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={errorMessage ? errorId : undefined}
            aria-invalid={errorMessage ? "true" : undefined}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            autoComplete="off"
          />
          <span className="entropix-date-picker__icon" aria-hidden="true">
            &#128197;
          </span>
        </div>

        {errorMessage && (
          <span id={errorId} className="entropix-date-picker__error" role="alert">
            {errorMessage}
          </span>
        )}

        {mounted &&
          isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className="entropix-date-picker__dropdown"
              style={dropdownStyle}
            >
              <Calendar
                value={selectedDate}
                onChange={handleCalendarChange}
                minDate={minDate}
                maxDate={maxDate}
              />
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
