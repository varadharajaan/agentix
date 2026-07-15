import { CodeXml } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center bg-gray-200 text-accent-amber">
        <CodeXml size={22} />
      </div>
      <h1 className="text-lg font-semibold text-ink-primary">
        Upload data, then ask
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Drop a CSV or spreadsheet in the sidebar, then describe what you want —
        the agent writes Python, runs it in a sandbox, and hands back charts,
        files, and a plain-language summary.
      </p>
    </div>
  );
}
