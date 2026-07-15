import { cn } from "@/lib/utils";
import { SessionFile } from "@/types/types";

import {
  Upload,
  Image as ImageIcon,
  File as FileIcon,
  Sparkles,
  ArrowUpFromLine,
  CodeXml,
} from "lucide-react";
import { useRef, useState, DragEvent } from "react";
import { FileSection } from "./file-section";

export function Sidebar({
  files,
  onUpload,
  uploading,
}: {
  files: SessionFile[];
  onUpload: (files: FileList) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) onUpload(e.dataTransfer.files);
  };

  const uploaded = files.filter((f) => f.origin === "uploaded");
  const generated = files.filter((f) => f.origin === "generated");
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-base-border bg-base-panel">
      <div className="flex items-center gap-3 border-b border-base-border px-4 py-4">
        <div className="flex p-2 items-center justify-center bg-accent-foreground">
          <CodeXml color="white" />
        </div>
        <div>
          <div className="font-bold">AI Code Interpreter</div>
          <div className="text-xs text-accent-foreground">
            Python · Sandboxed
          </div>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          console.log(dragOver);
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "m-3 flex cursor-pointer flex-col items-center justify-center gap-1.5 border border-dashed px-3 py-5 text-center transition-colors hover:bg-accent-foreground/5 hover:border-black/50",
          dragOver
            ? "border-black/50 bg-accent-foreground/5"
            : "border-black/20",
        )}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={18} className="text-ink-muted" />

        <div className="text-sm">
          {uploading ? "Uploading…" : "Drop files or click to upload"}
        </div>
        <div className="text-xs text-muted-foreground">
          CSV, XLSX, JSON, TXT, images
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && onUpload(e.target.files)}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <FileSection
          title="Uploaded"
          icon={ArrowUpFromLine}
          files={uploaded}
          empty="No files uploaded yet"
        />
        <FileSection
          title="Generated"
          icon={Sparkles}
          files={generated}
          empty="Nothing generated yet"
        />
      </div>
    </aside>
  );
}
