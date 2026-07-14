import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

export function ExecutionOutput({
  stdout,
  stderr,
}: {
  stdout: string;
  stderr: string;
}) {
  const hasError = stderr.trim().length > 0;
  if (!stdout.trim() && !stderr.trim()) return null;

  return (
    <div className="rounded-lg border px-4 py-3">
      <div className="mb-4 flex items-center gap-2  text-xs uppercase tracking-widest font-bold">
        Output
      </div>

      <CodeBlock code={stdout} language="text" />
      {stderr.trim() && <CodeBlock code={stderr} language="text" />}
    </div>
  );
}
