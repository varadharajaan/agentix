import { formatBytes } from "@/lib/utils";
import { SessionFile } from "@/types/types";
import {
  ArrowUpFromLine,
  FileIcon,
  FileJson,
  FileSpreadsheet,
  FileText,
  ImageIcon,
} from "lucide-react";

const kindIcon: Record<SessionFile["kind"], typeof FileIcon> = {
  image: ImageIcon,
  csv: FileSpreadsheet,
  excel: FileSpreadsheet,
  pdf: FileText,
  text: FileText,
  json: FileJson,
  other: FileIcon,
};

export function FileSection({
  title,
  icon: SectionIcon,
  files,
  empty,
}: {
  title: string;
  icon: typeof ArrowUpFromLine;
  files: SessionFile[];
  empty: string;
}) {
  return (
    <div className="mt-4 first:mt-4">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold bg-gray-100 py-2 px-3 ">
        <SectionIcon size={14} />
        {title}
        <span className="ml-auto">{files.length}</span>
      </div>
      {files.length === 0 ? (
        <div className="rounded-md px-2 py-2 text-xs">{empty}</div>
      ) : (
        <ul className="space-y-0.5">
          {files.map((file) => {
            const Icon = kindIcon[file.kind];
            return (
              <li key={file.name}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-muted transition-colors hover:bg-base-panel2 hover:text-ink-primary"
                >
                  <Icon size={12} className="shrink-0" />
                  <span className="truncate">{file.name}</span>
                  <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
                    {formatBytes(file.sizeBytes)}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
