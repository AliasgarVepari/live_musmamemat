import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary (Fill) - key CTAs
        default: "bg-brand-red-600 text-white hover:bg-brand-red-700 active:bg-brand-red-700 active:shadow-inner focus-visible:ring-white",
        // Secondary (Outline) - alt actions  
        secondary: "bg-transparent border border-border text-ink-900 hover:bg-red-tint-50 hover:border-brand-red-600 active:border-brand-red-700 active:bg-red-tint-50 focus-visible:ring-brand-red-600",
        outline: "bg-transparent border border-border text-ink-900 hover:bg-red-tint-50 hover:border-brand-red-600 active:border-brand-red-700 active:bg-red-tint-50 focus-visible:ring-brand-red-600",
        // Tertiary (Ghost/Text) - inline links
        ghost: "bg-transparent text-brand-red-600 hover:bg-red-tint-50 active:text-brand-red-700 focus-visible:ring-brand-red-600",
        // Category Pills / Toggle Buttons
        pill: "bg-surface text-ink-900 border border-border hover:bg-red-tint-50 focus-visible:ring-brand-red-600",
        "pill-active": "bg-red-tint-50 text-brand-red-600 border-2 border-brand-red-600 shadow-sm focus-visible:ring-brand-red-600",
        // Icon Buttons
        icon: "bg-transparent text-ink-900 hover:bg-red-tint-50 hover:text-brand-red-600 active:text-brand-red-700 focus-visible:ring-brand-red-600",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-brand-red-600 underline-offset-4 hover:underline hover:text-brand-red-700",
      },
      size: {
        default: "h-11 px-4 py-2 font-medium",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 font-medium",
        icon: "h-11 w-11",
        mobile: "h-12 px-4 py-2 font-medium",
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
