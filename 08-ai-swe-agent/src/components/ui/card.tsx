import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]",
        className
      )}
      {...props}
    />
  );
}
