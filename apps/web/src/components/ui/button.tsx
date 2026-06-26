import { cn } from "@/lib/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

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
          "inline-flex items-center justify-center rounded-md font-mono text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
          size === "sm" && "h-8 px-3 text-xs",
          size === "md" && "h-10 px-4",
          variant === "primary" &&
            "bg-[var(--blueprint)] text-white shadow-[var(--shadow-hard)] hover:bg-[var(--accent-hover)]",
          variant === "secondary" &&
            "border border-[var(--rule-soft)] bg-[var(--bg-surface)] text-[var(--ink)] hover:border-[var(--blueprint)]",
          variant === "ghost" && "text-[var(--ink-soft)] hover:bg-[var(--blueprint-tint)] hover:text-[var(--ink)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
