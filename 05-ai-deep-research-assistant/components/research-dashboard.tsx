"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Loader2, Microscope, SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useResearch } from "@/hooks/use-research";
import { PlanPanel } from "@/components/plan-panel";
import { SourcesPanel } from "@/components/sources-panel";
import { CitationsPanel } from "@/components/citations-panel";
import { ProgressTimeline } from "@/components/progress-timeline";
import { ReportView } from "@/components/report-view";

const EXAMPLE_QUESTIONS = [
  "Compare Next.js and Remix for enterprise applications.",
  "What are the latest advancements in 2026 on agentic AI?",
  "Research the semiconductor industry in India.",
  "Analyze NVIDIA's AI strategy.",
  "Compare LangChain, Mastra, and CrewAI.",
  "How will AI impact software engineering over the next five years?",
];

export function ResearchDashboard() {
  const [input, setInput] = useState("");
  const { state, run } = useResearch();
  const isRunning = state.status === "running";
  const showProgressSidebar =
    state.status === "running" || state.status === "done";
  const showLoadingState = state.status === "running" && !state.report;
  const showReport = Boolean(state.report);

  const activeSubtopicId = useMemo(() => {
    const last = [...state.timeline]
      .reverse()
      .find((t) => t.subtopicId && !t.done);
    return last?.subtopicId ?? null;
  }, [state.timeline]);

  const submitQuestion = () => {
    const question = input.trim();
    if (!question || isRunning) return;
    run(question);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitQuestion();
  };

  return (
    <div className="h-dvh flex flex-col bg-background">
      <header className="flex items-center gap-2 border-b p-5 shrink-0">
        <Microscope className="size-7 text-primary" />
        <h1 className="text-lg font-bold">Deep Research Assistant</h1>
        {state.status !== "idle" && (
          <Badge variant="outline" className="ml-2">
            {state.status === "running" && "Researching…"}
            {state.status === "done" && "Complete"}
            {state.status === "error" && "Error"}
          </Badge>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Left: Research workspace sidebar */}
        <aside className="w-80 border-r flex flex-col min-h-0 shrink-0">
          <Tabs defaultValue="plan" className="flex-1 min-h-0 flex flex-col">
            <div className="px-3 pt-3">
              <TabsList className="w-full">
                <TabsTrigger value="plan">Plan</TabsTrigger>
                <TabsTrigger value="sources">
                  Sources
                  {state.sources.length > 0 && (
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      {state.sources.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="citations">
                  Citations
                  {state.citations.length > 0 && (
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      {state.citations.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="plan" className="min-h-0">
              <ScrollArea className="h-full px-4 py-3">
                <PlanPanel
                  plan={state.plan}
                  subtopicResults={state.subtopicResults}
                  activeSubtopicId={activeSubtopicId}
                />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sources" className="min-h-0">
              <ScrollArea className="h-full px-4 py-3">
                <SourcesPanel sources={state.sources} plan={state.plan} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="citations" className="min-h-0">
              <ScrollArea className="h-full px-4 py-3">
                <CitationsPanel citations={state.citations} plan={state.plan} />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </aside>

        {/* Center: question box and report */}
        <main className="flex-1 min-h-0 flex flex-col">
          <div className="p-4 border-b shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a research question…"
                className="min-h-11 resize-none"
                disabled={isRunning}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitQuestion();
                  }
                }}
              />
              <Button
                type="submit"
                disabled={isRunning || !input.trim()}
                className="self-end"
              >
                {isRunning ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <SendHorizontal />
                )}
                Research
              </Button>
            </form>

            {state.status === "idle" && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setInput(q)}
                    className="text-xs px-2 py-1 rounded-full border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {state.status === "error" && (
              <p className="text-sm text-destructive mt-2">{state.error}</p>
            )}
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              {state.status === "idle" && (
                <div className="text-center text-muted-foreground text-sm py-24">
                  <Microscope className="size-8 mx-auto mb-3 opacity-40" />
                  This is a research workspace, not a chatbot. Ask a question
                  and watch the agent plan, search, verify, and write a cited
                  report.
                </div>
              )}

              {showLoadingState && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Loader2 className="size-8 animate-spin text-primary mb-4" />
                    <p className="text-sm font-medium">
                      Generating your research report…
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      The agent is gathering evidence and drafting the final
                      report.
                    </p>
                  </CardContent>
                </Card>
              )}

              {showReport && (
                <ReportView report={state.report!} question={state.question} />
              )}
            </div>
          </ScrollArea>
        </main>

        {showProgressSidebar && (
          <aside className="w-96 border-l flex flex-col min-h-0 shrink-0">
            <div className="p-4 border-b shrink-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Live Research Progress
              </p>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4">
                <ProgressTimeline
                  timeline={state.timeline}
                  status={state.status}
                />
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </div>
  );
}
