import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { diffSnapshots, ensureSessionDir, snapshotDir } from "./fs-utils";

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  success: boolean;
  durationMs: number;
  timedOut: boolean;
  changedFiles: string[];
}

const DEFAULT_TIMEOUT_MS = Number(process.env.PYTHON_EXEC_TIMEOUT_MS ?? 20_000);
const MAX_OUTPUT_CHARS = 20_000;

// Env var name patterns that should never reach generated code, even though
// we otherwise inherit the full parent environment (see buildChildEnv below).
const SECRET_KEY_PATTERN = /API_KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL/i;

/**
 * python3 is the right default on macOS/Linux, but most Windows Python
 * installs (including the official python.org installer and the newer
 * "py"/Python Install Manager launcher) only register `python` on PATH.
 * Override with PYTHON_BIN if your setup differs (e.g. a venv interpreter,
 * or "py" with a version flag baked into PYTHON_BIN_ARGS below).
 */
const PYTHON_BIN =
  process.env.PYTHON_BIN ??
  (process.platform === "win32" ? "python" : "python3");
const PYTHON_BIN_ARGS = process.env.PYTHON_BIN_ARGS
  ? process.env.PYTHON_BIN_ARGS.split(" ").filter(Boolean)
  : [];

function truncate(s: string) {
  if (s.length <= MAX_OUTPUT_CHARS) return s;
  return (
    s.slice(0, MAX_OUTPUT_CHARS) +
    `\n… [truncated ${s.length - MAX_OUTPUT_CHARS} chars]`
  );
}

/**
 * Inherit the full parent environment (redacting anything that looks like a
 * secret) rather than allowlisting a handful of vars. An allowlist is
 * appealing for "minimal blast radius", but it's also Unix-shaped by
 * default — a naive PATH/HOME/LANG allowlist silently breaks Windows, where
 * tooling (including Python's own launcher) depends on APPDATA,
 * LOCALAPPDATA, SystemRoot, USERPROFILE, and friends to find its own
 * install state. Missing those can make some Python launchers think Python
 * isn't installed and try to reinstall it on every single run.
 */
function buildChildEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const key of Object.keys(env)) {
    if (SECRET_KEY_PATTERN.test(key)) delete env[key];
  }
  env.PYTHONUNBUFFERED = "1";
  env.PYTHONDONTWRITEBYTECODE = "1";
  env.MPLBACKEND = "Agg"; // headless matplotlib so plt.savefig() works without a display
  return env;
}

/**
 * Runs `code` in an isolated Python process whose cwd is the session's
 * working directory (so it can read uploaded files and write artifacts by
 * plain relative filename). This is a *process*-level sandbox, not a full
 * container: it strips the shell, restricts cwd, drops most environment
 * variables, and enforces a wall-clock timeout. For untrusted multi-tenant
 * deployments, run this inside a locked-down container / microVM
 * (gVisor, Firecracker, Docker with --network=none, etc.) instead of a bare
 * subprocess — see README "Security notes".
 */
export async function executePython(
  sessionId: string,
  code: string,
): Promise<ExecuteResult> {
  const cwd = await ensureSessionDir(sessionId);
  const before = await snapshotDir(cwd);

  const scriptName = `_run_${randomUUID().slice(0, 8)}.py`;
  const scriptPath = path.join(cwd, scriptName);
  await fs.writeFile(scriptPath, code, "utf-8");

  const start = Date.now();
  let stdout = "";
  let stderr = "";
  let timedOut = false;

  const childEnv = buildChildEnv();

  const result = await new Promise<{ code: number | null }>((resolve) => {
    const child = spawn(PYTHON_BIN, [...PYTHON_BIN_ARGS, "-I", scriptName], {
      cwd,
      env: childEnv,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, DEFAULT_TIMEOUT_MS);

    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({ code: exitCode });
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      stderr += `\nFailed to start "${PYTHON_BIN}": ${err.message}`;
      resolve({ code: 1 });
    });
  });

  // Clean up the script file so it doesn't show up as a generated artifact.
  await fs.rm(scriptPath, { force: true });

  const after = await snapshotDir(cwd);
  const changedFiles = diffSnapshots(before, after);

  if (timedOut) {
    stderr += `\nExecution timed out after ${DEFAULT_TIMEOUT_MS}ms and was terminated.`;
  }

  return {
    stdout: truncate(stdout),
    stderr: truncate(stderr),
    success: !timedOut && result.code === 0,
    durationMs: Date.now() - start,
    timedOut,
    changedFiles,
  };
}
