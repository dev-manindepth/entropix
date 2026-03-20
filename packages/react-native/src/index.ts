// === Theme Provider ===
export { EntropixProvider, useTheme } from "./theme/theme-context.js";
export type { EntropixTheme, ThemeMode, EntropixProviderProps } from "./theme/theme-context.js";

// === Adapter Utilities ===
export { mapAccessibilityToRN } from "./utils/map-accessibility-to-rn.js";
export type { RNAccessibilityProps } from "./utils/types.js";

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
export type { InputProps, InputSize } from "./components/input.js";

export { Textarea } from "./components/textarea.js";
export type { TextareaProps, TextareaSize } from "./components/textarea.js";

export { Checkbox } from "./components/checkbox.js";
export type { CheckboxProps, CheckboxSize } from "./components/checkbox.js";

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

// === Responsive Hooks ===
export { useBreakpoint, useBreakpointValue, useScreenDimensions, BREAKPOINTS } from "./utils/use-breakpoint.js";
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
