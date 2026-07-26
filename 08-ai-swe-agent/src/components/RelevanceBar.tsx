export function RelevanceBar({ score }: { score: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="trace-track h-1.5 w-16 rounded-full">
        <div
          className="trace-fill h-full rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[11px] text-[var(--text-faint)] tabular-nums">
        {pct}%
      </span>
    </div>
  );
}
