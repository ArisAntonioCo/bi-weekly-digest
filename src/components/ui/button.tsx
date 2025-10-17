import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        brand:
          "bg-brand text-brand-foreground shadow-lg shadow-brand/30 hover:bg-brand/90 hover:scale-105 rounded-full",
        "brand-cta":
          "bg-brand text-brand-foreground shadow-lg shadow-brand/30 hover:bg-brand/90 hover:scale-105 rounded-full",
        promo:
          "inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold bg-brand text-brand-foreground hover:bg-brand/90 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 px-8 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  // Special handling for brand-cta variant
  if (variant === "brand-cta" && !asChild) {
    const iconSize = size === "lg" ? "h-5 w-5" : size === "sm" ? "h-3 w-3" : "h-4 w-4"
    const iconPadding = size === "lg" ? "p-2" : size === "sm" ? "p-1" : "p-1.5"
    const rightPadding = size === "lg" ? "pr-14" : size === "sm" ? "pr-10" : "pr-12"
    
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }), "relative", rightPadding)}
        {...props}
      >
        <span>{children}</span>
        <span className={cn(
          "absolute right-2 flex items-center justify-center bg-black rounded-full",
          iconPadding
        )}>
          <ArrowRight className={cn("text-brand", iconSize)} />
        </span>
      </Comp>
    )
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
