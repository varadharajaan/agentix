import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { executePython } from "./executor";
import {
  ArtifactFile,
  ChatRunResult,
  ExecutionAttempt,
  TimelineStep,
} from "@/types/types";
import { listSessionFiles, sessionDir, toArtifactFile } from "./fs-utils";

const MAX_RETRIES = Number(process.env.MAX_AGENT_RETRIES ?? 3);

const SYSTEM_PROMPT = `You are an AI Code Interpreter, similar to ChatGPT's Code Interpreter / Advanced Data Analysis.

You solve problems by writing and executing Python, not by guessing at answers from memory.

You have one tool, \`execute_python\`, which runs code in a persistent working directory (a
sandboxed Python process, not a notebook — each call is a fresh interpreter, but the *filesystem*
persists across calls within this conversation). Rules for using it well:

- Any file the user uploaded is already sitting in the working directory under its original
  filename — read it with a plain relative path, e.g. pd.read_csv("sales.csv").
- Save every output you want the user to keep (charts, cleaned data, reports) as a file in the
  working directory using plt.savefig(...), df.to_csv(...), etc. Only files written to disk are
  shown to the user — printed output alone is not persisted as an artifact.
- Prefer matplotlib for charts (headless backend is already configured). Always savefig with a
  descriptive filename and dpi=150 or higher, then plt.close().
- Print short, informative status lines (row counts, key numbers) — they are shown to the user
  as execution output.
- If a run fails, read the traceback, fix the actual bug, and try again. Don't repeat an
  identical failing snippet.
- Keep each code block focused on one step. You may call the tool multiple times in a
  conversation if a task genuinely needs sequential steps.
- Once execution has produced what the user needs, stop calling the tool and instead write a
  short, plain-language explanation: what you did, the key numbers or findings, and (only if
  genuinely useful) a next-step suggestion. Do not restate the raw stdout verbatim — interpret it.`;

// The model only ever needs the *schema* here — every call is intercepted and
// run through executePython() in the loop below so we can track timeline
// state, retries, and artifact diffs. The `func` is a safety fallback in case
// something invokes the tool directly.
const executePythonTool = tool(
  async ({ code }: { code: string }) => {
    const result = await executePython("__direct_invoke_fallback__", code);
    return formatToolResult(result);
  },
  {
    name: "execute_python",
    description:
      "Execute a Python script in the session's sandboxed working directory. Returns stdout, " +
      "stderr, and the exit status. Files written to the working directory become downloadable " +
      "artifacts for the user.",
    schema: z.object({
      code: z.string().describe("The complete Python script to run."),
    }),
  },
);

function newTimeline(): TimelineStep[] {
  return [
    { id: "understand", label: "Understanding request", status: "pending" },
    { id: "inspect", label: "Inspecting uploaded files", status: "pending" },
    { id: "generate", label: "Generating Python", status: "pending" },
    { id: "execute", label: "Executing code", status: "pending" },
    { id: "recover", label: "Recovering from errors", status: "pending" },
    { id: "artifacts", label: "Saving files", status: "pending" },
    { id: "explain", label: "Preparing explanation", status: "pending" },
  ];
}

function setStep(
  timeline: TimelineStep[],
  id: TimelineStep["id"],
  status: TimelineStep["status"],
  detail?: string,
) {
  const step = timeline.find((s) => s.id === id);
  if (!step) return;
  step.status = status;
  if (detail) step.detail = detail;
  if (status === "active") step.startedAt = Date.now();
  if (status === "done" || status === "error") step.endedAt = Date.now();
}

export interface RunAgentParams {
  sessionId: string;
  prompt: string;
  /** Prior turns, oldest first, for multi-turn context. */
  history?: { role: "user" | "assistant"; content: string }[];
  onTimelineUpdate?: (timeline: TimelineStep[]) => void;
}

export async function runAgent({
  sessionId,
  prompt,
  history = [],
  onTimelineUpdate,
}: RunAgentParams): Promise<ChatRunResult> {
  const timeline = newTimeline();
  const emit = () => onTimelineUpdate?.(timeline.map((s) => ({ ...s })));

  const attempts: ExecutionAttempt[] = [];
  const artifactsByName = new Map<string, ArtifactFile>();

  if (!process.env.OPENAI_API_KEY) {
    setStep(timeline, "understand", "error", "Missing OPENAI_API_KEY");
    emit();
    return {
      sessionId,
      prompt,
      timeline,
      attempts,
      finalCode: null,
      finalOutput: null,
      artifacts: [],
      explanation: "",
      error:
        "OPENAI_API_KEY is not set. Add it to your .env.local file — see .env.example.",
    };
  }

  setStep(timeline, "understand", "active");
  emit();

  const model = new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    // Reasoning-tier models (gpt-5.x) only accept the default temperature —
    // omit it rather than hardcoding a value that would error on those models.
    apiKey: process.env.OPENAI_API_KEY,
  }).bindTools([executePythonTool]);

  setStep(timeline, "understand", "done");
  setStep(timeline, "inspect", "active");
  emit();

  const files = await listSessionFiles(sessionId);
  const fileListing =
    files.length > 0
      ? files
          .map(
            (f) =>
              `- ${f.name} (${f.origin}, ${Math.round(f.sizeBytes / 1024)} KB)`,
          )
          .join("\n")
      : "(no files uploaded yet)";

  setStep(
    timeline,
    "inspect",
    "done",
    files.length ? `${files.length} file(s) in the workspace` : undefined,
  );
  emit();

  const messages: BaseMessage[] = [
    new SystemMessage(SYSTEM_PROMPT),
    ...history.map((h) =>
      h.role === "user"
        ? new HumanMessage(h.content)
        : new AIMessage(h.content),
    ),
    new HumanMessage(
      `Files currently in the working directory:\n${fileListing}\n\nUser request: ${prompt}`,
    ),
  ];

  setStep(timeline, "generate", "active");
  emit();

  let finalCode: string | null = null;
  let finalOutput: { stdout: string; stderr: string } | null = null;
  let explanation = "";
  let toolRounds = 0;
  const maxRounds = MAX_RETRIES + 1;

  while (toolRounds < maxRounds) {
    const response = await model.invoke(messages);
    messages.push(response);

    const toolCalls = response.tool_calls ?? [];
    if (toolCalls.length === 0) {
      // Model is done calling tools — its text content is the explanation.
      explanation = extractText(response);
      break;
    }

    setStep(timeline, "generate", "done");

    for (const call of toolCalls) {
      const code = (call.args as { code: string }).code;
      finalCode = code;

      setStep(timeline, "execute", "active");
      emit();

      const attemptNumber = attempts.length + 1;
      const result = await executePython(sessionId, code);

      attempts.push({
        attempt: attemptNumber,
        code,
        stdout: result.stdout,
        stderr: result.stderr,
        success: result.success,
        durationMs: result.durationMs,
      });
      finalOutput = { stdout: result.stdout, stderr: result.stderr };

      if (result.success) {
        setStep(timeline, "execute", "done", `${result.durationMs}ms`);
        const recoverStep = timeline.find((s) => s.id === "recover")!;
        setStep(
          timeline,
          "recover",
          recoverStep.status === "active" ? "done" : "skipped",
        );
      } else {
        setStep(
          timeline,
          "execute",
          "error",
          result.timedOut ? "Timed out" : "Execution failed",
        );
        if (toolRounds + 1 < maxRounds) {
          setStep(timeline, "recover", "active");
        } else {
          setStep(timeline, "recover", "error", "Retry limit reached");
        }
      }
      emit();

      if (result.changedFiles.length > 0) {
        setStep(timeline, "artifacts", "active");
        for (const filename of result.changedFiles) {
          const stat = await fs.stat(
            path.join(sessionDir(sessionId), filename),
          );
          artifactsByName.set(
            filename,
            toArtifactFile(sessionId, filename, stat.size),
          );
        }
        setStep(
          timeline,
          "artifacts",
          "done",
          `${result.changedFiles.length} file(s)`,
        );
        emit();
      }

      messages.push(
        new ToolMessage({
          tool_call_id: call.id ?? `call_${attemptNumber}`,
          content: formatToolResult(result),
        }),
      );
    }

    toolRounds++;
    if (toolRounds < maxRounds) {
      setStep(timeline, "generate", "active");
      emit();
    }
  }

  if (!explanation) {
    // Ran out of retries without a clean final text response — ask once more,
    // explicitly telling the model to stop using tools and summarize.
    messages.push(
      new HumanMessage(
        "Stop here and summarize what happened so far in plain language, including any errors " +
          "that couldn't be resolved.",
      ),
    );
    const wrapUp = await new ChatOpenAI({
      model: process.env.OPENAI_MODEL ?? "gpt-5.6",
      apiKey: process.env.OPENAI_API_KEY,
    }).invoke(messages);
    explanation = extractText(wrapUp);
  }

  setStep(timeline, "explain", "done");
  emit();

  return {
    sessionId,
    prompt,
    timeline,
    attempts,
    finalCode,
    finalOutput,
    artifacts: Array.from(artifactsByName.values()),
    explanation,
  };
}

function extractText(message: AIMessage): string {
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) {
    return message.content
      .filter(
        (block): block is { type: "text"; text: string } =>
          block.type === "text",
      )
      .map((block) => block.text)
      .join("\n");
  }
  return "";
}

function formatToolResult(result: {
  stdout: string;
  stderr: string;
  success: boolean;
  changedFiles: string[];
}): string {
  const parts = [
    `exit status: ${result.success ? "success" : "error"}`,
    `stdout:\n${result.stdout || "(empty)"}`,
    `stderr:\n${result.stderr || "(empty)"}`,
  ];
  if (result.changedFiles.length) {
    parts.push(`files written: ${result.changedFiles.join(", ")}`);
  }
  return parts.join("\n\n");
}
