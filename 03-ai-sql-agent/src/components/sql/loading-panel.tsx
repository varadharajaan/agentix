"use client";

import { useEffect, useState } from "react";

const steps = [
  "🔍 Discovering database tables...",
  "📋 Inspecting table schemas...",
  "🧠 Generating SQL query...",
  "⚡ Executing SQL query...",
  "📊 Analyzing results...",
  "✨ Preparing explanation...",
];

export default function LoadingPanel() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((current) =>
        current === steps.length - 1 ? current : current + 1,
      );
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8 border bg-card p-6 mt-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />

        <p className="text-sm font-medium">{steps[step]}</p>
      </div>
    </div>
  );
}
