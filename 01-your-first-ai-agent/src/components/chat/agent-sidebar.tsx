"use client";

import { Bot, Sparkles, Wrench } from "lucide-react";
import { tools } from "@/agent/tools";

const agents = [
  {
    name: "Assistant Agent",
    description:
      "The Assistant Agent is responsible for understanding the user’s request, deciding whether a tool is needed, and selecting and executing the right tool when required. It then interprets the tool’s result and generates a clear, accurate final response.",
    status: "Active",
  },
];

function formatToolName(name: string) {
  return name.replace(/_/g, " ");
}

export function AgentSidebar() {
  return (
    <aside className="hidden sticky top-0 self-start h-full w-80 shrink-0 flex-col border-r border-border bg-card/70 lg:flex">
      <div className="space-y-6">
        <div className="flex items-center gap-3  bg-background/80 border-b p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-md font-bold">Agentic AI</p>
            <p className="text-xs text-muted-foreground">
              Your first Agentic AI Agent
            </p>
          </div>
        </div>

        <section className="px-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Active agents
          </p>
          <div className="mt-3 space-y-2">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="rounded-xl border border-border bg-background/70 p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {agent.status}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {agent.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Available tools
          </p>
          <div className="mt-3 space-y-2">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="rounded-xl border border-border bg-gray-100 p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <Wrench className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize">
                      {formatToolName(tool.name)}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
