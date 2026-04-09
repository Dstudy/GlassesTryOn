import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:saturate-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_16px_30px_-18px_hsl(var(--primary)/0.7)] hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-[0_24px_45px_-20px_hsl(var(--primary)/0.8)] hover:[&_svg]:translate-x-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_14px_26px_-18px_hsl(var(--destructive)/0.65)] hover:-translate-y-0.5 hover:bg-destructive/92 hover:shadow-[0_20px_36px_-18px_hsl(var(--destructive)/0.7)]",
        outline:
          "border border-input bg-background/95 shadow-[0_10px_24px_-20px_hsl(var(--primary)/0.45)] hover:-translate-y-0.5 hover:border-accent/70 hover:bg-accent/14 hover:text-foreground hover:shadow-[0_20px_40px_-24px_hsl(var(--accent)/0.65)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_12px_26px_-20px_hsl(var(--secondary-foreground)/0.28)] hover:-translate-y-0.5 hover:bg-secondary/90 hover:shadow-[0_18px_34px_-20px_hsl(var(--secondary-foreground)/0.35)]",
        ghost:
          "hover:-translate-y-0.5 hover:bg-accent/12 hover:text-primary hover:shadow-[0_16px_32px_-24px_hsl(var(--accent)/0.7)]",
        link: "rounded-none px-0 shadow-none text-primary underline-offset-4 hover:text-primary/80 hover:underline active:scale-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
