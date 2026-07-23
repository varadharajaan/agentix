"use client";

import { Brain } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useMemoryChat } from "@/hooks/use-memory-chat";
import { MemoryPanel } from "@/components/memory-panel";
import { ChatPanel } from "@/components/chat-panel";

export function MemoryAssistant() {
  const { state, sendMessage, forgetMemory } = useMemoryChat();

  return (
    <div className="h-dvh flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b p-5 shrink-0">
        <Brain className="size-7 text-primary" />
        <h1 className="text-lg font-bold">AI Memory Assistant</h1>
        {state.memories.length > 0 && (
          <Badge variant="outline" className="ml-2">
            {state.memories.length}{" "}
            {state.memories.length === 1 ? "memory" : "memories"}
          </Badge>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-80 border-r flex flex-col min-h-0 shrink-0">
          <div className="px-5 pt-5 pb-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Memory
            </p>
          </div>
          <ScrollArea className="flex-1 min-h-0 px-5 pb-4 mt-3">
            <MemoryPanel
              memories={state.memories}
              isRemembering={state.isRemembering}
              recentActivity={state.recentActivity}
              onForget={forgetMemory}
              loaded={state.memoriesLoaded}
            />
          </ScrollArea>
        </aside>

        <main className="flex-1 min-h-0 flex flex-col">
          <ChatPanel
            messages={state.messages}
            isReplying={state.isReplying}
            isRemembering={state.isRemembering}
            error={state.error}
            onSend={sendMessage}
          />
        </main>
      </div>
    </div>
  );
}
