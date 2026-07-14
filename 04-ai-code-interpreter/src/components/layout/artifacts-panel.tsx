import {
  Download,
  FileSpreadsheet,
  FileText,
  File as FileIcon,
  FileJson,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { ArtifactFile } from "@/types/types";

const kindIcon: Record<ArtifactFile["kind"], typeof FileIcon> = {
  image: FileIcon,
  csv: FileSpreadsheet,
  excel: FileSpreadsheet,
  pdf: FileText,
  text: FileText,
  json: FileJson,
  other: FileIcon,
};

export function ArtifactsPanel({ artifacts }: { artifacts: ArtifactFile[] }) {
  if (artifacts.length === 0) return null;

  const images = artifacts.filter((a) => a.kind === "image");
  const others = artifacts.filter((a) => a.kind !== "image");

  return (
    <div className="rounded-lg border px-4 py-3">
      <div className="mb-4 text-xs font-bold uppercase tracking-widest">
        Generated artifacts
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {images.map((img) => (
          <a
            key={img.path}
            href={img.url}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-lg border border-base-border bg-base-panel2 transition-colors hover:border-accent-amber/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.name}
              className="max-h-72 w-full object-contain bg-[#0B0D13]"
            />
            <div className="flex items-center justify-between px-3 py-2 text-xs">
              <span className="truncate text-ink-muted">{img.name}</span>
              <span className="font-mono text-ink-faint">
                {formatBytes(img.sizeBytes)}
              </span>
            </div>
          </a>
        ))}
        {others.map((file) => {
          const Icon = kindIcon[file.kind];
          return (
            <a
              key={file.path}
              href={file.url}
              download={file.name}
              className="flex items-center gap-3 rounded-lg border border-base-border bg-base-panel2 px-3 py-3 transition-colors hover:border-accent-amber/50"
            >
              <Icon size={18} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatBytes(file.sizeBytes)}
                </div>
              </div>
              <Download size={16} className="shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
