"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-mono text-[12px] rounded-sm font-medium uppercase tracking-[0.04em] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-white hover:bg-neutral-800",
        primary: "bg-accent-600 text-white hover:bg-accent-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white",
        "outline-subtle":
          "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900 hover:bg-neutral-50",
        secondary: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        ghost:
          "hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border-transparent",
        link: "text-neutral-900 underline-offset-4 hover:underline tracking-normal normal-case font-display font-medium",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
