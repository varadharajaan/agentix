"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { FileSearch, Loader2, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageBubble } from "@/components/chat-message";
import type { UiMessage } from "@/hooks/use-rag-chat";

const SUGGESTIONS = [
  "What is our refund policy?",
  "Explain our API authentication flow.",
  "Summarize this document.",
  "Which section discusses security?",
];

interface ChatPanelProps {
  messages: UiMessage[];
  isReplying: boolean;
  chatStatusMessage: string | null;
  error: string | null;
  hasReadyDocuments: boolean;
  onSend: (text: string) => void;
}

export function ChatPanel({
  messages,
  isReplying,
  chatStatusMessage,
  error,
  hasReadyDocuments,
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
        <div className="max-w-4xl mx-auto p-6 space-y-5">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-20">
              <FileSearch className="size-8 mx-auto mb-3 opacity-40" />
              {hasReadyDocuments
                ? "Ask a question and the assistant will answer using your uploaded documents."
                : "Upload a document on the left, then ask a question grounded in it."}
              <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="text-xs px-2 py-1 rounded-full border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
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
        {chatStatusMessage && (
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin" />
            {chatStatusMessage}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents…"
            className="resize-none max-h-32"
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
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
}
