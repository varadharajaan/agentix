"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { RelevanceBar } from "@/components/RelevanceBar";
import { ChatMessage } from "@/lib/types";

const SUGGESTIONS = [
  "Explain this project.",
  "How is authentication implemented?",
  "Which files interact with the database?",
  "Find potential bugs in the codebase.",
];

export function ChatPanel({
  repoId,
  onOpenSource,
}: {
  repoId: string;
  onOpenSource: (path: string, startLine: number, endLine: number) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingHistory(true);
    fetch(`/api/chat?repoId=${repoId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMessages(data.messages ?? []);
      })
      .finally(() => !cancelled && setLoadingHistory(false));
    return () => {
      cancelled = true;
    };
  }, [repoId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;

    setInput("");
    setSending(true);
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, repoId, role: "user", content, createdAt: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId, message: content }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}-a`,
          repoId,
          role: "assistant",
          content: data.answer,
          sources: data.sources,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}-e`,
          repoId,
          role: "assistant",
          content: `⚠️ ${err instanceof Error ? err.message : "Request failed."}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {!loadingHistory && messages.length === 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs text-[var(--text-faint)]">Try asking:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full rounded-md border border-[var(--border)] px-3 py-2 text-left text-sm text-[var(--text-muted)] hover:border-[var(--text-faint)] hover:text-[var(--text)]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="flex gap-2.5">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-inset)]">
              {m.role === "user" ? (
                <User className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              ) : (
                <Bot className="h-3.5 w-3.5 text-[var(--accent)]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="markdown-body text-[13.5px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
              </div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 space-y-1.5 border-t border-[var(--border-soft)] pt-2">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--text-faint)]">
                    Retrieved from
                  </p>
                  {m.sources.slice(0, 5).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => onOpenSource(s.path, s.startLine, s.endLine)}
                      className="flex w-full items-center justify-between gap-3 rounded px-1.5 py-1 text-left hover:bg-[var(--bg-inset)]"
                    >
                      <span className="truncate font-mono text-[11.5px] text-[var(--text-muted)]">
                        {s.path}:{s.startLine}-{s.endLine}
                      </span>
                      {"score" in s && typeof (s as { score?: number }).score === "number" && (
                        <RelevanceBar score={(s as { score: number }).score} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-2 pl-8 text-sm text-[var(--text-faint)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Searching the repository…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-[var(--border)] p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this codebase…"
          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <Button type="submit" variant="primary" size="md" disabled={sending || !input.trim()}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
