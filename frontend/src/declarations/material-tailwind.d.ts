import {} from '@material-tailwind/react'

type EventCapture = {
  children?: unknown
  placeholder?: unknown
  onPointerEnterCapture?: unknown
  onPointerLeaveCapture?: unknown
}

declare module '@material-tailwind/react' {
  export interface ButtonProps extends EventCapture {
    placeholder?: unknown
  }

  export interface IconButtonProps extends EventCapture {
    placeholder?: unknown
  }
  export interface InputProps extends EventCapture {
    crossOrigin?: unknown
  }
  export interface SelectProps extends EventCapture {
    placeholder?: unknown
  }
  export interface TypographyProps extends EventCapture {
    placeholder?: unknown
  }
  export interface CheckboxProps extends EventCapture {
    placeholder?: unknown
    crossOrigin?: unknown
  }
  export interface ListProps extends EventCapture {
    placeholder?: unknown
  }
  export interface ListItemProps extends EventCapture {
    placeholder?: unknown
  }
  export interface CardProps extends EventCapture {
    placeholder?: unknown
  }
  export interface CardHeaderProps extends EventCapture {
    placeholder?: unknown
  }
  export interface CardBodyProps extends EventCapture {
    placeholder?: unknown
  }
  export interface CardFooterProps extends EventCapture {
    placeholder?: unknown
  }
  export interface MenuListProps extends EventCapture {
    placeholder?: unknown
  }
  export interface MenuItemProps extends EventCapture {
    placeholder?: unknown
  }
  export interface TabsHeaderProps extends EventCapture {
    placeholder?: unknown
  }
  export interface TabProps extends EventCapture {
    placeholder?: unknown
  }
  export interface TabsBodyProps extends EventCapture {
    placeholder?: unknown
  }
  export interface TabPanelProps extends EventCapture {
    placeholder?: unknown
  }
  export interface TabsProps extends EventCapture {
    placeholder?: unknown
  }
  export interface AvatarProps extends EventCapture {
    placeholder?: unknown
  }
  export interface AccordionProps extends EventCapture {
    placeholder?: unknown
  }
  export interface AccordionHeaderProps extends EventCapture {
    placeholder?: unknown
  }
  export interface AccordionBodyProps extends EventCapture {
    placeholder?: unknown
  }
  export interface ProgressProps extends EventCapture {
    placeholder?: unknown
  }
  export interface DialogProps extends EventCapture {
    placeholder?: unknown
  }
  export interface DialogHeaderProps extends EventCapture {
    placeholder?: unknown
  }
  export interface DialogBodyProps extends EventCapture {
    placeholder?: unknown
  }
  export interface DialogFooterProps extends EventCapture {
    placeholder?: unknown
  }
  export interface SwitchProps extends EventCapture {
    placeholder?: unknown
    crossOrigin?: unknown
  }
  export interface SpinnerProps extends EventCapture {
    placeholder?: unknown
  }
  export interface BreadcrumbsProps extends EventCapture {
    placeholder?: unknown
  }
}
