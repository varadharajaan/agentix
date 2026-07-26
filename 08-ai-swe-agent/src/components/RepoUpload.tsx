"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, Loader2, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RepoUpload({ onIngested }: { onIngested: (repoId: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setStatus("uploading");
    setError(null);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed.");
      onIngested(data.repoId);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  }, [onIngested]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]">
          <FolderGit2 className="h-6 w-6 text-[var(--accent)]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">AI Software Engineering Agent</h1>
        <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
          Upload a project as a ZIP. It&apos;ll be indexed locally with embeddings so you
          can ask it anything about the codebase — architecture, bugs, docs, tests.
        </p>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) upload(file);
        }}
        className={cn(
          "flex w-full max-w-md cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-8 py-12 transition-colors",
          dragging
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--text-faint)]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
        {status === "uploading" ? (
          <>
            <Loader2 className="h-7 w-7 animate-spin text-[var(--accent)]" />
            <div className="text-center">
              <p className="text-sm font-medium">Indexing {fileName}…</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Extracting, chunking, and generating embeddings — this can take a
                minute for larger repos.
              </p>
            </div>
          </>
        ) : (
          <>
            <UploadCloud className="h-7 w-7 text-[var(--text-muted)]" />
            <div className="text-center">
              <p className="text-sm font-medium">Drop your repository .zip here</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">or click to browse</p>
            </div>
          </>
        )}
      </label>

      {error && (
        <div className="mt-4 max-w-md rounded-md border border-[var(--danger)] bg-[var(--danger-soft)] px-4 py-2 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      <div className="mt-8 flex items-center gap-3 text-xs text-[var(--text-faint)]">
        <span>No GitHub auth</span>
        <span className="h-1 w-1 rounded-full bg-[var(--text-faint)]" />
        <span>No OAuth</span>
        <span className="h-1 w-1 rounded-full bg-[var(--text-faint)]" />
        <span>Runs entirely on your machine</span>
      </div>

      <Button variant="ghost" size="sm" className="mt-4" onClick={() => inputRef.current?.click()}>
        Choose a file instead
      </Button>
    </div>
  );
}
