// === Adapter Utilities ===
export { mapAccessibilityToAria } from "./utils/map-accessibility-to-aria.js";
export { useKeyboardHandler } from "./utils/use-keyboard-handler.js";

// === Focus Management ===
export { useFocusTrap } from "./focus/use-focus-trap.js";
export { useFocusRestore } from "./focus/use-focus-restore.js";

// === Components ===
export { Button } from "./components/button.js";
export type { ButtonProps } from "./components/button.js";

export { Toggle } from "./components/toggle.js";
export type { ToggleProps } from "./components/toggle.js";

export { Switch } from "./components/switch.js";
export type { SwitchProps } from "./components/switch.js";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
} from "./components/dialog/index.js";
export type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
  DialogOverlayProps,
} from "./components/dialog/index.js";

export {
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from "./components/tabs/index.js";
export type {
  TabsProps,
  TabListProps,
  TabProps,
  TabPanelProps,
} from "./components/tabs/index.js";

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "./components/accordion/index.js";
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionPanelProps,
} from "./components/accordion/index.js";

export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "./components/menu/index.js";
export type {
  MenuProps,
  MenuTriggerProps,
  MenuContentProps,
  MenuItemProps,
} from "./components/menu/index.js";

// === Form Components ===
export { Input } from "./components/input.js";
export type { InputProps } from "./components/input.js";

export { Textarea } from "./components/textarea.js";
export type { TextareaProps } from "./components/textarea.js";

export { Checkbox } from "./components/checkbox.js";
export type { CheckboxProps } from "./components/checkbox.js";

export {
  RadioGroup,
  RadioItem,
} from "./components/radio/index.js";
export type {
  RadioGroupProps,
  RadioItemProps,
} from "./components/radio/index.js";

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectOption,
} from "./components/select/index.js";
export type {
  SelectProps,
  SelectTriggerProps,
  SelectContentProps,
  SelectOptionProps,
} from "./components/select/index.js";

// === Toast ===
export { ToastProvider, useToastContext } from "./components/toast/index.js";
export type {
  ToastProviderProps,
  ToastContextValue,
  ToastItem,
  ToastType,
} from "./components/toast/index.js";

// === Popover / Tooltip ===
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
} from "./components/popover/index.js";
export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  TooltipProps,
  PopoverPlacement,
  PopoverTriggerMode,
} from "./components/popover/index.js";

// === DatePicker / Calendar ===
export { DatePicker, Calendar } from "./components/date-picker/index.js";
export type {
  DatePickerProps,
  CalendarProps,
} from "./components/date-picker/index.js";

// === Breadcrumb ===
export { Breadcrumb, BreadcrumbItem } from "./components/breadcrumb/index.js";
export type {
  BreadcrumbProps,
  BreadcrumbItemProps,
} from "./components/breadcrumb/index.js";

// === Pagination ===
export { Pagination } from "./components/pagination/index.js";
export type { PaginationProps } from "./components/pagination/index.js";

// === Responsive Hooks ===
export { useBreakpoint, useMediaQuery, useBreakpointValue, BREAKPOINTS } from "./utils/use-breakpoint.js";
export type { Breakpoint } from "./utils/use-breakpoint.js";

// === Layout Primitives ===
export {
  Stack,
  Inline,
  Container,
  Divider,
} from "./components/layout/index.js";
export type {
  StackProps,
  InlineProps,
  ContainerProps,
  ContainerSize,
  DividerProps,
  SpacingSize,
} from "./components/layout/index.js";

// === i18n ===
export { LocaleProvider, useLocale } from "./i18n/index.js";
export type { LocaleProviderProps } from "./i18n/index.js";
