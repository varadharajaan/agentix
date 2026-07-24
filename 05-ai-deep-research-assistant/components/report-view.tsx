"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";

interface ReportViewProps {
  report: string;
  question: string;
}

export function ReportView({ report, question }: ReportViewProps) {
  const handleExport = () => {
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = question
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);
    a.href = url;
    a.download = `${slug || "research-report"}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-md font-medium text-muted-foreground">
          <FileText className="size-5" />
          Final Report
        </div>
        <Button size="sm" onClick={handleExport}>
          <Download />
          Export .md
        </Button>
      </div>
      <Separator />
      <div className="prose-report pt-5">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
      </div>
    </div>
  );
}
