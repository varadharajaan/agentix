"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export function TabBar({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-inset)]"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
