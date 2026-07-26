"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderGit2, Files, Search as SearchIcon, ArrowLeftRight, Loader2 } from "lucide-react";
import { TabBar } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileTree } from "@/components/FileTree";
import { SearchPanel } from "@/components/SearchPanel";
import { CodeViewer } from "@/components/CodeViewer";
import { ChatPanel } from "@/components/ChatPanel";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { Repository, RepoFile } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function Dashboard({
  repoId,
  onSwitchRepo,
}: {
  repoId: string;
  onSwitchRepo: () => void;
}) {
  const [repo, setRepo] = useState<Repository | null>(null);
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [sidebarTab, setSidebarTab] = useState<"files" | "search">("files");

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [fileLanguage, setFileLanguage] = useState<string>("plaintext");
  const [fileLoading, setFileLoading] = useState(false);
  const [highlightLines, setHighlightLines] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetch(`/api/repos/${repoId}`).then((r) => r.json()).then((d) => setRepo(d.repo));
    fetch(`/api/repos/${repoId}/files`).then((r) => r.json()).then((d) => setFiles(d.files ?? []));
  }, [repoId]);

  const openFile = useCallback(
    async (path: string, lines?: [number, number]) => {
      setSelectedPath(path);
      setHighlightLines(lines ?? null);
      setFileLoading(true);
      try {
        const res = await fetch(`/api/repos/${repoId}/file?path=${encodeURIComponent(path)}`);
        const data = await res.json();
        setFileContent(data.file?.content ?? "");
        setFileLanguage(data.file?.language ?? "plaintext");
      } finally {
        setFileLoading(false);
      }
    },
    [repoId]
  );

  const openSource = useCallback(
    (path: string, start: number, end: number) => openFile(path, [start, end]),
    [openFile]
  );

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <FolderGit2 className="h-4 w-4 text-[var(--accent)]" />
          <span className="font-medium">{repo?.name ?? "…"}</span>
          {repo?.status === "ready" && (
            <span className="ml-2 flex items-center gap-3 font-mono text-[11px] text-[var(--text-faint)]">
              <span>{formatNumber(repo.fileCount)} files</span>
              <span>{formatNumber(repo.chunkCount)} chunks</span>
              <span>{formatNumber(repo.totalLines)} lines</span>
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onSwitchRepo}>
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Switch repository
        </Button>
      </header>

      {/* Main workspace */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--border)]">
          <div className="border-b border-[var(--border)] p-2">
            <TabBar
              tabs={[
                { value: "files", label: "Files", icon: <Files className="h-3.5 w-3.5" /> },
                { value: "search", label: "Search", icon: <SearchIcon className="h-3.5 w-3.5" /> },
              ]}
              value={sidebarTab}
              onChange={(v) => setSidebarTab(v as "files" | "search")}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidebarTab === "files" ? (
              <div className="p-2">
                <FileTree
                  paths={files.map((f) => f.path)}
                  selectedPath={selectedPath}
                  onSelect={(p) => openFile(p)}
                />
              </div>
            ) : (
              <SearchPanel repoId={repoId} onSelect={openSource} />
            )}
          </div>
        </aside>

        {/* Code viewer */}
        <section className="min-w-0 flex-1 border-r border-[var(--border)]">
          <CodeViewer
            path={selectedPath}
            language={fileLanguage}
            content={fileContent}
            loading={fileLoading}
            highlightLines={highlightLines}
          />
        </section>

        {/* Chat */}
        <section className="w-[26rem] shrink-0">
          <ChatPanel repoId={repoId} onOpenSource={openSource} />
        </section>
      </div>

      {/* Bottom analysis panel */}
      <div className="h-80 shrink-0 border-t border-[var(--border)]">
        <AnalysisPanel repoId={repoId} selectedPath={selectedPath} onOpenSource={openSource} />
      </div>
    </div>
  );
}
