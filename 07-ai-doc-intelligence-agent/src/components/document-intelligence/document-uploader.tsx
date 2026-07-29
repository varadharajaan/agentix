"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadDocuments } from "@/lib/api-client";
import type { DocumentRecord } from "@/lib/types";

const ACCEPTED = ".pdf,.docx,.txt,.md,.csv,.json";

export function DocumentUploader({
  onUploaded,
}: {
  onUploaded: (documents: DocumentRecord[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setIsUploading(true);
      try {
        const documents = await uploadDocuments(Array.from(fileList));
        onUploaded(documents);
        toast.success(
          documents.length === 1
            ? `${documents[0].filename} uploaded — processing started.`
            : `${documents.length} files uploaded — processing started.`
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setIsUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onUploaded]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
        isDragging ? "border-accent bg-accent/10" : "border-border bg-muted/40"
      )}
    >
      <UploadCloud className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Drag files here, or{" "}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-primary underline underline-offset-2"
        >
          browse
        </button>
      </p>
      <p className="text-xs text-muted-foreground/70">PDF, DOCX, TXT, Markdown, CSV, JSON</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {isUploading && (
        <Button variant="ghost" size="sm" disabled className="mt-1">
          Uploading…
        </Button>
      )}
    </div>
  );
}
