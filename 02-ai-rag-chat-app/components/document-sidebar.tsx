"use client";

import { useRef } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  FileUp,
  Loader2,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RagDocument } from "@/lib/rag/types";

interface DocumentSidebarProps {
  documents: RagDocument[];
  documentsLoaded: boolean;
  uploadingFilename: string | null;
  uploadStatusMessage: string | null;
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
}

const ACCEPTED = ".pdf,.txt,.md,.markdown";

export function DocumentSidebar({
  documents,
  documentsLoaded,
  uploadingFilename,
  uploadStatusMessage,
  onUpload,
  onDelete,
}: DocumentSidebarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="w-full">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={Boolean(uploadingFilename)}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-dashed p-5 text-center transition border-gray-300 bg-gray-100 hover:border-gray-500 w-full"
        >
          {uploadingFilename ? (
            <LoaderCircle className="mx-auto mb-3 size-6 animate-spin " />
          ) : (
            <FileUp className="mx-auto mb-3 size-6 " />
          )}
          <span className="block text-sm font-medium">
            {uploadingFilename ? "Processing…" : "Upload document"}
          </span>
          <span className="mt-1 block text-xs ">PDF, TXT, or Markdown</span>
        </button>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Documents
        </p>

        {!documentsLoaded ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents yet. Upload one to build the knowledge base.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="group flex items-start gap-2 rounded-md px-2 py-1.5 -mx-2 hover:bg-accent transition-colors"
              >
                <StatusIcon status={doc.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug truncate">
                    {doc.title}
                  </p>
                  {doc.status === "ready" && (
                    <p className="text-xs text-muted-foreground">
                      {doc.chunkCount} chunk{doc.chunkCount === 1 ? "" : "s"}
                    </p>
                  )}
                  {doc.status === "processing" && (
                    <p className="text-xs text-muted-foreground">Processing…</p>
                  )}
                  {doc.status === "error" && (
                    <p
                      className="text-xs text-destructive truncate"
                      title={doc.errorMessage}
                    >
                      {doc.errorMessage ?? "Failed to process"}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(doc.id)}
                  aria-label="Delete document"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: RagDocument["status"] }) {
  if (status === "ready") {
    return (
      <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
    );
  }
  if (status === "processing") {
    return (
      <Loader2 className="size-4 mt-0.5 shrink-0 animate-spin text-primary" />
    );
  }
  if (status === "error") {
    return <AlertCircle className="size-4 mt-0.5 shrink-0 text-destructive" />;
  }
  return <FileText className="size-4 mt-0.5 shrink-0 text-muted-foreground" />;
}

export function DocumentCountBadge({
  documents,
}: {
  documents: RagDocument[];
}) {
  const ready = documents.filter((d) => d.status === "ready").length;
  if (documents.length === 0) return null;
  return (
    <Badge variant="outline" className="ml-2">
      {ready}/{documents.length} ready
    </Badge>
  );
}
