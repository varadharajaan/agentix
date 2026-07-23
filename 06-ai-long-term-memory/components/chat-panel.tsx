"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, SendHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageBubble } from "@/components/chat-message";
import type { UiMessage } from "@/hooks/use-memory-chat";

const SUGGESTIONS = [
  "My favorite programming language is TypeScript.",
  "I'm building an AI course.",
  "I switched from React to Svelte.",
  "What project should I build next?",
];

interface ChatPanelProps {
  messages: UiMessage[];
  isReplying: boolean;
  isRemembering: boolean;
  error: string | null;
  onSend: (text: string) => void;
}

export function ChatPanel({
  messages,
  isReplying,
  isRemembering,
  error,
  onSend,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    const text = input.trim();
    if (!text || isReplying) return;
    setInput("");
    onSend(text);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-6xl mx-auto p-6 space-y-5">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-20">
              <Sparkles className="size-8 mx-auto mb-3 opacity-40" />
              Tell the assistant something about yourself, then come back later
              and see it remembered.
              <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="text-sm px-2 py-1 rounded-full border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <ChatMessageBubble key={m.id} message={m} />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4 shrink-0">
        {error && <p className="text-sm text-destructive mb-2">{error}</p>}
        {isRemembering && !isReplying && (
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin" />
            Updating memory from that exchange…
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something…"
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <Button
            type="submit"
            disabled={isReplying || !input.trim()}
            className="self-end"
          >
            {isReplying ? (
              <Loader2 className="animate-spin" />
            ) : (
              <SendHorizontal />
            )}
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
