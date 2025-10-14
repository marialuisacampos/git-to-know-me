import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        primary: "bg-blue-600/90 hover:bg-blue-600 text-white",
        "outline-glass":
          "bg-slate-900/30 backdrop-blur-md border border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700 transition-all duration-200",
        "outline-simple":
          "border border-slate-700 hover:bg-slate-800 text-slate-300",
        "solid-dark": "bg-slate-800 hover:bg-slate-700 text-slate-100 border-0",
        "ghost-subtle": "text-slate-500 hover:text-slate-200",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        "dev-special":
          "bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/30 text-blue-100",
        outline:
          "border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 text-slate-300",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
