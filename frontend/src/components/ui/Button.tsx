"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
          size === "md" ? "px-5 py-2.5 text-sm" : "px-3.5 py-1.5 text-xs",
          variant === "primary" &&
            "bg-brand-600 text-white shadow-card hover:bg-brand-700 active:scale-[0.98]",
          variant === "secondary" &&
            "border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-100 hover:border-brand-500 dark:hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-300",
          variant === "ghost" && "text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-800 dark:hover:text-ink-100",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
