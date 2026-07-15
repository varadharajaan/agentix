import { AlertTriangle, Bot, CodeXml, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ClientRun } from "@/types/client-types";
import { Badge } from "../ui/badge";
import { ExecutionTimeline } from "./execution-timeline";
import { CodeBlock } from "./code-block";
import { ExecutionOutput } from "./execution-output";
import { ArtifactsPanel } from "./artifacts-panel";

export function RunCard({ run }: { run: ClientRun }) {
  const attempts = run.result?.attempts ?? [];
  const lastAttempt = attempts[attempts.length - 1];
  const retried = attempts.length > 1;

  return (
    <div className="border-b border-base-border/60 px-6 py-6 last:border-b-0">
      {/* Prompt */}
      <div className="mb-4 flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-foreground">
          <User size={16} color="white" />
        </div>
        <p className="mt-1 text-sm">{run.prompt}</p>
      </div>

      {/* Agent response */}
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
          <CodeXml size={16} color="black" />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <ExecutionTimeline steps={run.timeline} />

          {run.error && (
            <div className="flex items-start gap-2 rounded-lg border border-accent-coral/30 bg-accent-coral/5 px-3 py-2.5 text-sm text-accent-coral">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{run.error}</span>
            </div>
          )}

          {run.result?.finalCode && (
            <div className="rounded-lg border px-4 py-3">
              <div className="mb-4 flex items-center gap-2  text-xs uppercase tracking-widest font-bold">
                Generated python
                {retried && (
                  <Badge className="bg-accent-foreground/10 p-2 rounded-2xl">
                    {attempts.length} attempts
                  </Badge>
                )}
              </div>
              <CodeBlock code={run.result.finalCode} language="python" />
            </div>
          )}

          {lastAttempt && (
            <ExecutionOutput
              stdout={lastAttempt.stdout}
              stderr={lastAttempt.stderr}
            />
          )}

          {run.result?.artifacts && (
            <ArtifactsPanel artifacts={run.result.artifacts} />
          )}

          {run.result?.explanation && (
            <div className="prose prose-sm leading-relaxed">
              <ReactMarkdown>{run.result.explanation}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
