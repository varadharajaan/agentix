export type StepStatus = "pending" | "active" | "done" | "error" | "skipped";

export type StepId =
  | "understand"
  | "inspect"
  | "generate"
  | "execute"
  | "recover"
  | "artifacts"
  | "explain";

export interface TimelineStep {
  id: StepId;
  label: string;
  status: StepStatus;
  detail?: string;
  startedAt?: number;
  endedAt?: number;
}

export interface ExecutionAttempt {
  attempt: number;
  code: string;
  stdout: string;
  stderr: string;
  success: boolean;
  durationMs: number;
}

export interface ArtifactFile {
  name: string;
  path: string; // relative path under the session's generated dir
  url: string; // fetchable URL, e.g. /api/files/{sessionId}/generated/{name}
  kind: "image" | "csv" | "pdf" | "excel" | "text" | "json" | "other";
  sizeBytes: number;
}

export interface SessionFile {
  name: string;
  url: string;
  sizeBytes: number;
  origin: "uploaded" | "generated";
  kind: ArtifactFile["kind"];
}

export interface ChatRunResult {
  sessionId: string;
  prompt: string;
  timeline: TimelineStep[];
  attempts: ExecutionAttempt[];
  finalCode: string | null;
  finalOutput: { stdout: string; stderr: string } | null;
  artifacts: ArtifactFile[];
  explanation: string;
  error?: string;
}
