"use client";

import { useEffect, useState } from "react";
import { FolderGit2, Plus, AlertCircle, Loader2 } from "lucide-react";
import { RepoUpload } from "@/components/RepoUpload";
import { Dashboard } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Repository } from "@/lib/types";
import { formatNumber, timeAgo } from "@/lib/utils";

export default function Home() {
  const [repos, setRepos] = useState<Repository[] | null>(null);
  const [activeRepoId, setActiveRepoId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    refreshRepos();
  }, []);

  function refreshRepos() {
    fetch("/api/repos")
      .then((r) => r.json())
      .then((d) => setRepos(d.repos ?? []));
  }

  if (activeRepoId) {
    return <Dashboard repoId={activeRepoId} onSwitchRepo={() => setActiveRepoId(null)} />;
  }

  if (repos === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--text-faint)]" />
      </div>
    );
  }

  if (repos.length === 0 || showUpload) {
    return (
      <RepoUpload
        onIngested={(repoId) => {
          refreshRepos();
          setActiveRepoId(repoId);
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]">
            <FolderGit2 className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Your repositories</h1>
            <p className="text-xs text-[var(--text-muted)]">Pick one to keep exploring, or index a new project.</p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowUpload(true)}>
          <Plus className="h-3.5 w-3.5" />
          New repository
        </Button>
      </div>

      <div className="space-y-2">
        {repos.map((repo) => (
          <Card
            key={repo.id}
            className="flex cursor-pointer items-center justify-between px-4 py-3 hover:border-[var(--text-faint)]"
            onClick={() => repo.status === "ready" && setActiveRepoId(repo.id)}
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{repo.name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-[var(--text-faint)]">
                {repo.status === "ready" &&
                  `${formatNumber(repo.fileCount)} files · ${formatNumber(repo.chunkCount)} chunks · ${formatNumber(repo.totalLines)} lines · ${timeAgo(repo.createdAt)}`}
                {repo.status === "indexing" && "Indexing…"}
                {repo.status === "error" && repo.error}
              </p>
            </div>
            {repo.status === "indexing" && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--text-faint)]" />
            )}
            {repo.status === "error" && (
              <AlertCircle className="h-4 w-4 shrink-0 text-[var(--danger)]" />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
