import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none",
          size === "sm" ? "h-8 px-3 text-sm" : "h-9 px-4 text-sm",
          variant === "primary" &&
            "bg-[var(--accent)] text-[#1b1305] hover:bg-[var(--accent-strong)]",
          variant === "outline" &&
            "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-elevated)]",
          variant === "ghost" &&
            "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
