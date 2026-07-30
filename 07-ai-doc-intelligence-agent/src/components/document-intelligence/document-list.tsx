"use client";

import { FileText, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { deleteDocument as deleteDocumentApi } from "@/lib/api-client";
import type { DocumentRecord, DocumentStatus } from "@/lib/types";

function statusBadge(status: DocumentStatus) {
  switch (status) {
    case "ready":
      return <Badge variant="secondary">Ready</Badge>;
    case "processing":
      return (
        <Badge variant="outline" className="gap-1">
          <Loader2 className="size-3 animate-spin" /> Processing
        </Badge>
      );
    case "error":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({
  documents,
  selectedIds,
  onToggleSelect,
  onDeleted,
}: {
  documents: DocumentRecord[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onDeleted: (id: string) => void;
}) {
  async function handleDelete(id: string, filename: string) {
    try {
      await deleteDocumentApi(id);
      onDeleted(id);
      toast.success(`${filename} removed.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't delete document.",
      );
    }
  }

  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground px-1 py-4 text-center">
        No documents yet — upload something to get started.
      </p>
    );
  }

  return (
    <ScrollArea className="h-full pr-2">
      <ul className="flex flex-col gap-1.5">
        {documents.map((doc) => {
          const isSelected = selectedIds.includes(doc.id);
          const isSelectable = doc.status === "ready";
          return (
            <li key={doc.id}>
              {/* This row used to be a <button>, which put the delete
                  <Button> (itself a <button>) inside another <button> —
                  invalid HTML and the source of the hydration warning.
                  A div with role="button" + keyboard handling keeps the
                  same click/keyboard behavior without nesting buttons. */}
              <div
                role="button"
                tabIndex={isSelectable ? 0 : -1}
                aria-pressed={isSelected}
                aria-disabled={!isSelectable}
                onClick={() => isSelectable && onToggleSelect(doc.id)}
                onKeyDown={(e) => {
                  if (!isSelectable) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggleSelect(doc.id);
                  }
                }}
                className={cn(
                  "w-full text-left rounded-lg border px-3 py-2.5 transition-colors flex items-start gap-2.5",
                  isSelectable
                    ? "cursor-pointer"
                    : "opacity-70 cursor-not-allowed",
                  isSelected
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card hover:bg-secondary/60",
                )}
              >
                <FileText className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.filename}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {statusBadge(doc.status)}
                    <span className="text-xs text-muted-foreground">
                      {formatSize(doc.sizeBytes)}
                      {doc.pageCount ? ` · ${doc.pageCount} pages` : ""}
                    </span>
                  </div>
                  {doc.status === "error" && doc.errorMessage && (
                    <p className="mt-1 text-xs text-destructive">
                      {doc.errorMessage}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  {isSelected && <X className="size-3.5 text-accent mt-1" />}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.id, doc.filename);
                    }}
                  >
                    <Trash2 className="size-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
}
