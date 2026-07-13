"use client";

import { EmptyState } from "@/components/layout/empty-state";
import { PromptBar } from "@/components/layout/prompt-bar";
import { RunCard } from "@/components/layout/run-card";
import { Sidebar } from "@/components/layout/sidebar";
import { ClientRun } from "@/types/client-types";
import { SessionFile } from "@/types/types";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [files, setFiles] = useState<SessionFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [runs, setRuns] = useState<ClientRun[]>([]);
  const [running, setRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/session", { method: "POST" })
      .then((r) => r.json())
      .then((data) => setSessionId(data.sessionId));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [runs]);

  async function refreshFiles(sid: string) {
    const res = await fetch(`/api/files/${sid}`);
    if (res.ok) {
      const data = await res.json();
      setFiles(data.files);
    }
  }

  async function handleUpload(fileList: FileList) {
    if (!sessionId) return;
    setUploading(true);
    const form = new FormData();
    form.append("sessionId", sessionId);
    Array.from(fileList).forEach((f) => form.append("files", f));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.files) setFiles(data.files);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(prompt: string) {
    if (!sessionId || running) return;
    const runId = crypto.randomUUID();
    const history = runs
      .filter((r) => r.status === "done" && r.result)
      .flatMap((r) => [
        { role: "user" as const, content: r.prompt },
        { role: "assistant" as const, content: r.result!.explanation },
      ]);
    setRuns((prev) => [
      ...prev,
      { id: runId, prompt, status: "running", timeline: [] },
    ]);
    setRunning(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, prompt, history }),
      });
      if (!res.body) throw new Error("No response stream from server");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.type === "timeline") {
            setRuns((prev) =>
              prev.map((r) =>
                r.id === runId ? { ...r, timeline: event.timeline } : r,
              ),
            );
          } else if (event.type === "result") {
            setRuns((prev) =>
              prev.map((r) =>
                r.id === runId
                  ? {
                      ...r,
                      status: event.result.error ? "error" : "done",
                      timeline: event.result.timeline,
                      result: event.result,
                      error: event.result.error,
                    }
                  : r,
              ),
            );
            if (event.result.artifacts?.length) await refreshFiles(sessionId);
          } else if (event.type === "fatal") {
            setRuns((prev) =>
              prev.map((r) =>
                r.id === runId
                  ? { ...r, status: "error", error: event.error }
                  : r,
              ),
            );
          }
        }
      }
    } catch (err) {
      setRuns((prev) =>
        prev.map((r) =>
          r.id === runId
            ? {
                ...r,
                status: "error",
                error: err instanceof Error ? err.message : "Request failed",
              }
            : r,
        ),
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-base-bg">
      <Sidebar files={files} onUpload={handleUpload} uploading={uploading} />

      <main className="flex min-w-0 flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {runs.length === 0 ? (
            <EmptyState />
          ) : (
            runs.map((run) => <RunCard key={run.id} run={run} />)
          )}
        </div>
        <PromptBar
          onSubmit={handleSubmit}
          disabled={running || !sessionId}
          showSuggestions={runs.length === 0}
        />
      </main>
    </div>
  );
}
