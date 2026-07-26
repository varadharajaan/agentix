"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Folder, FileCode2 } from "lucide-react";
import { buildFileTree, TreeNode, cn } from "@/lib/utils";

export function FileTree({
  paths,
  selectedPath,
  onSelect,
}: {
  paths: string[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  const tree = useMemo(() => buildFileTree(paths), [paths]);

  return (
    <div className="text-sm">
      {tree.map((node) => (
        <Node key={node.path} node={node} depth={0} selectedPath={selectedPath} onSelect={onSelect} />
      ))}
    </div>
  );
}

function Node({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = useState(depth < 1);

  if (node.type === "file") {
    const active = node.path === selectedPath;
    return (
      <button
        onClick={() => onSelect(node.path)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded px-2 py-1 text-left truncate",
          active
            ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
            : "text-[var(--text-muted)] hover:bg-[var(--bg-inset)] hover:text-[var(--text)]"
        )}
        style={{ paddingLeft: depth * 14 + 8 }}
        title={node.path}
      >
        <FileCode2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
        <span className="truncate font-mono text-[12.5px]">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[var(--text-muted)] hover:bg-[var(--bg-inset)] hover:text-[var(--text)]"
        style={{ paddingLeft: depth * 14 + 8 }}
      >
        <ChevronRight
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-90")}
        />
        <Folder className="h-3.5 w-3.5 shrink-0 opacity-70" />
        <span className="truncate text-[12.5px]">{node.name}</span>
      </button>
      {open && node.children && (
        <div>
          {node.children.map((child) => (
            <Node
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
