export { cx } from './cx.js';
export * from './theme.js';

// Vague 1 — primitives & feedback
export {
  Button,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from './components/Button.js';
export { Card, type CardProps } from './components/Card.js';
export { Badge, type BadgeProps, type BadgeTone } from './components/Badge.js';
export { Tag, type TagProps } from './components/Tag.js';
export {
  StatusIndicator,
  type StatusIndicatorProps,
  type Status,
} from './components/StatusIndicator.js';
export { Spinner, type SpinnerProps, type SpinnerSize } from './components/Spinner.js';
export { Skeleton, type SkeletonProps } from './components/Skeleton.js';
export { Progress, type ProgressProps } from './components/Progress.js';
export { Banner, type BannerProps, type BannerTone } from './components/Banner.js';

// Hooks
export { useControllableState, useFieldIds, useConst } from './hooks.js';

// Vague 2 — Foundation : formulaires (champs & saisie)
export {
  Field,
  fieldDescribedBy,
  controlBase,
  controlBorder,
  type FieldProps,
} from './components/form/Field.js';
export { Input, type InputProps, type InputSize } from './components/form/Input.js';
export { SearchInput, type SearchInputProps } from './components/form/SearchInput.js';
export { Textarea, type TextareaProps } from './components/form/Textarea.js';
export { PromptInput, type PromptInputProps } from './components/form/PromptInput.js';
export { Checkbox, type CheckboxProps } from './components/form/Checkbox.js';
export { RadioGroup, type RadioGroupProps, type RadioOption } from './components/form/Radio.js';
export { Switch, type SwitchProps } from './components/form/Switch.js';
export { Select, type SelectProps, type SelectOption } from './components/form/Select.js';
export {
  ButtonGroup,
  type ButtonGroupProps,
  type SegmentOption,
} from './components/form/ButtonGroup.js';

// Vague 2 — Foundation : surfaces & primitives
export { Tooltip, type TooltipProps } from './components/overlay/Tooltip.js';
export { Popover, type PopoverProps } from './components/overlay/Popover.js';
export { Avatar, type AvatarProps, type AvatarSize } from './components/Avatar.js';
export {
  IconButton,
  type IconButtonProps,
  type IconButtonVariant,
  type IconButtonSize,
} from './components/IconButton.js';
export { Divider, type DividerProps } from './components/Divider.js';
export { ScrollArea, type ScrollAreaProps } from './components/ScrollArea.js';
