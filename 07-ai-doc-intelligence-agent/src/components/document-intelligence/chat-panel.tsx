"use client";

import { useState } from "react";
import { SendHorizonal, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { sendChatMessage } from "@/lib/api-client";
import type { MessageRecord } from "@/lib/types";

const SUGGESTIONS = [
  "Summarize this document.",
  "Extract every email address.",
  "What is the total revenue mentioned?",
];

export function ChatPanel({
  selectedDocumentIds,
  hasDocuments,
}: {
  selectedDocumentIds: string[];
  hasDocuments: boolean;
}) {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function send(text: string) {
    const question = text.trim();
    if (!question || isSending) return;

    const optimisticUserMessage: MessageRecord = {
      id: `local-${crypto.randomUUID()}`,
      conversationId: conversationId ?? "pending",
      role: "user",
      content: question,
      citations: null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInput("");
    setIsSending(true);

    try {
      const result = await sendChatMessage({
        message: question,
        conversationId,
        documentIds: selectedDocumentIds,
      });
      setConversationId(result.conversationId);
      setMessages((prev) => [...prev, result.message]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "The agent couldn't respond.",
      );
      setMessages((prev) =>
        prev.filter((m) => m.id !== optimisticUserMessage.id),
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-4 p-1">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <Sparkles className="size-6 text-accent" />
              <p className="text-sm text-muted-foreground max-w-xs">
                {hasDocuments
                  ? "Ask a question, request a summary, or extract information from your documents."
                  : "Upload a document on the left, then ask anything about it here."}
              </p>
              {hasDocuments && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="citation-tab bg-primary/25 hover:bg-primary/40 text-primary-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col gap-1.5 ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border"
                }`}
              >
                <div className="[&_p]:my-1.5 first:[&_p]:mt-0 last:[&_p]:mb-0 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_a]:underline">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
              {m.citations && m.citations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-w-[85%]">
                  {m.citations.slice(0, 6).map((c, i) => (
                    <span
                      key={`${c.chunkId}-${i}`}
                      className="citation-tab"
                      title={c.snippet}
                    >
                      {c.filename}
                      {c.page ? ` · p.${c.page}` : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex items-start">
              <div className="rounded-xl border bg-card px-3.5 py-2.5 text-sm text-muted-foreground">
                Thinking…
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-end gap-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={
            hasDocuments
              ? "Ask about your documents…"
              : "Upload a document first…"
          }
          disabled={!hasDocuments}
          className="min-h-[44px] max-h-32 resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!hasDocuments || isSending || !input.trim()}
        >
          <SendHorizonal className="size-4" />
        </Button>
      </form>
    </div>
  );
}
