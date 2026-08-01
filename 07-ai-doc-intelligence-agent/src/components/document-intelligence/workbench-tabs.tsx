"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  compareDocuments,
  extractFromDocument,
  generateReport,
  sendChatMessage,
} from "@/lib/api-client";
import type { DocumentRecord } from "@/lib/types";

const proseClasses =
  "text-sm [&_p]:my-2 first:[&_p]:mt-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-4 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-4 [&_strong]:font-semibold";

export function WorkbenchTabs({ documents }: { documents: DocumentRecord[] }) {
  const readyDocs = documents.filter((d) => d.status === "ready");

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
        <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="pt-3">
        <SummaryTab documents={readyDocs} />
      </TabsContent>
      <TabsContent value="extracted" className="pt-3">
        <ExtractionTab documents={readyDocs} />
      </TabsContent>
      <TabsContent value="comparisons" className="pt-3">
        <ComparisonTab documents={readyDocs} />
      </TabsContent>
      <TabsContent value="reports" className="pt-3">
        <ReportsTab documents={readyDocs} />
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-sm text-muted-foreground py-6 text-center">{text}</p>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard.");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Unable to copy content.");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={handleCopy}
      aria-label="Copy content"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  );
}

function DocPicker({
  documents,
  value,
  onChange,
  multiple,
}: {
  documents: DocumentRecord[];
  value: string[];
  onChange: (ids: string[]) => void;
  multiple?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {documents.map((d) => {
        const selected = value.includes(d.id);
        return (
          <button
            key={d.id}
            type="button"
            onClick={() =>
              multiple
                ? onChange(
                    selected
                      ? value.filter((v) => v !== d.id)
                      : [...value, d.id],
                  )
                : onChange([d.id])
            }
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              selected
                ? "border bg-primary/15 text-accent-foreground"
                : "border bg-secondary/40 text-muted-foreground hover:bg-secondary"
            }`}
          >
            {d.filename}
          </button>
        );
      })}
    </div>
  );
}

function SummaryTab({ documents }: { documents: DocumentRecord[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (selected.length === 0) return;
    setLoading(true);
    setSummary(null);
    try {
      const result = await sendChatMessage({
        message: "Summarize this document.",
        documentIds: selected,
      });
      setSummary(result.message.content);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't generate summary.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (documents.length === 0)
    return <EmptyState text="Upload a document to summarize it here." />;

  return (
    <div className="flex flex-col gap-3">
      <DocPicker
        documents={documents}
        value={selected}
        onChange={setSelected}
      />
      <Button
        size="sm"
        onClick={run}
        disabled={selected.length === 0 || loading}
        className="w-fit"
      >
        {loading ? "Summarizing…" : "Summarize"}
      </Button>
      {summary && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-2 mt-2">
            <p className="text-sm font-medium">File Report</p>
            <CopyButton value={summary} />
          </div>
          <div className={proseClasses}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

function ExtractionTab({ documents }: { documents: DocumentRecord[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("Every email address");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof extractFromDocument>
  > | null>(null);

  async function run() {
    if (selected.length === 0 || !instructions.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await extractFromDocument({
        documentId: selected[0],
        instructions,
      });
      setResult(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extraction failed.");
    } finally {
      setLoading(false);
    }
  }

  if (documents.length === 0)
    return <EmptyState text="Upload a document to extract data from it." />;

  return (
    <div className="flex flex-col gap-3">
      <DocPicker
        documents={documents}
        value={selected}
        onChange={setSelected}
      />
      <div className="flex gap-2">
        <Input
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="What should be extracted? e.g. every invoice number and amount"
        />
        <Button
          size="sm"
          onClick={run}
          disabled={selected.length === 0 || !instructions.trim() || loading}
        >
          {loading ? "Extracting…" : "Extract"}
        </Button>
      </div>

      {result && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <CopyButton value={JSON.stringify(result, null, 2)} />
          </div>
          <p className="text-sm text-muted-foreground">
            {result.extraction?.summary}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Page</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.extraction?.items?.length ? (
                result.extraction.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell className="whitespace-normal">
                      {item.value}
                    </TableCell>
                    <TableCell>{item.sourcePage ?? "—"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground text-center"
                  >
                    Nothing matched that request.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function ComparisonTab({ documents }: { documents: DocumentRecord[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<string | null>(null);

  async function run() {
    if (selected.length < 2) return;
    setLoading(true);
    setComparison(null);
    try {
      const res = await compareDocuments({ documentIds: selected, focus });
      setComparison(res.comparison);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Comparison failed.");
    } finally {
      setLoading(false);
    }
  }

  if (documents.length < 2)
    return <EmptyState text="Upload at least two documents to compare them." />;

  return (
    <div className="flex flex-col gap-3">
      <DocPicker
        documents={documents}
        value={selected}
        onChange={setSelected}
        multiple
      />
      <div className="flex gap-2">
        <Input
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="Optional focus, e.g. payment terms"
        />
        <Button
          size="sm"
          onClick={run}
          disabled={selected.length < 2 || loading}
        >
          {loading ? "Comparing…" : "Compare"}
        </Button>
      </div>
      {comparison && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <CopyButton value={comparison} />
          </div>
          <div className={proseClasses}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {comparison}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsTab({ documents }: { documents: DocumentRecord[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [reportType, setReportType] = useState<
    "executive_summary" | "detailed_report"
  >("executive_summary");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  async function run() {
    if (selected.length === 0) return;
    setLoading(true);
    setReport(null);
    try {
      const res = await generateReport({ documentIds: selected, reportType });
      setReport(res.report);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Report generation failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (documents.length === 0)
    return <EmptyState text="Upload a document to generate a report." />;

  return (
    <div className="flex flex-col gap-3">
      <DocPicker
        documents={documents}
        value={selected}
        onChange={setSelected}
        multiple
      />
      <div className="flex flex-wrap items-center gap-2">
        <Tabs
          value={reportType}
          onValueChange={(v) => setReportType(v as typeof reportType)}
        >
          <TabsList>
            <TabsTrigger value="executive_summary">
              Executive Summary
            </TabsTrigger>
            <TabsTrigger value="detailed_report">Detailed Report</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          size="sm"
          onClick={run}
          disabled={selected.length === 0 || loading}
        >
          {loading ? "Generating…" : "Generate"}
        </Button>
      </div>
      {report && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <CopyButton value={report} />
          </div>
          <div className={proseClasses}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
