"use client";

import { useState } from "react";
import {
  Briefcase,
  Check,
  Loader2,
  Settings2,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Memory, MemoryType } from "@/lib/memory/types";
import type { MemoryActivity } from "@/hooks/use-memory-chat";
import { cn } from "@/lib/utils";

interface MemoryPanelProps {
  memories: Memory[];
  isRemembering: boolean;
  recentActivity: MemoryActivity[];
  onForget: (id: string) => void;
  loaded: boolean;
}

const GROUPS: Array<{
  type: MemoryType;
  label: string;
  icon: typeof Sparkles;
}> = [
  { type: "preference", label: "Preferences", icon: Sparkles },
  { type: "goal", label: "Goals", icon: Target },
  { type: "project", label: "Projects", icon: Briefcase },
  { type: "constraint", label: "Constraints", icon: Settings2 },
];

export function MemoryPanel({
  memories,
  isRemembering,
  recentActivity,
  onForget,
  loaded,
}: MemoryPanelProps) {
  const [justChanged, setJustChanged] = useState<Set<string>>(new Set());

  // Briefly highlight memories that were just created/updated so the panel
  // visibly reacts, matching "students immediately see what the AI remembers".
  const highlightIds = new Set(
    recentActivity.slice(-3).map((a) => a.memory.id),
  );

  if (!loaded) {
    return <p className="text-sm text-muted-foreground">Loading memory…</p>;
  }

  if (memories.length === 0 && !isRemembering) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing remembered yet. Chat for a bit and durable facts will show up
        here automatically.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {isRemembering && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Updating memory…
        </div>
      )}

      {GROUPS.map((group) => {
        const items = memories.filter((m) => m.type === group.type);
        if (items.length === 0) return null;
        const Icon = group.icon;

        return (
          <div key={group.type}>
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="size-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {group.label}
              </p>
            </div>
            <ul className="space-y-1.5">
              {items.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    "group flex items-start gap-2 rounded-md px-2 py-1.5 -mx-2 transition-colors",
                    highlightIds.has(m.id) && "bg-accent",
                  )}
                >
                  <Check className="size-3.5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm leading-snug flex-1">
                    {m.content}
                  </span>
                  {m.confidence !== "high" && (
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px] px-1.5 py-0"
                    >
                      {m.confidence}
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    onClick={() => onForget(m.id)}
                    aria-label="Forget this memory"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
