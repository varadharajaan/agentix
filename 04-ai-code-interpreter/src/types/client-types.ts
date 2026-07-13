import { ChatRunResult, TimelineStep } from "./types";

export interface ClientRun {
  id: string;
  prompt: string;
  status: "running" | "done" | "error";
  timeline: TimelineStep[];
  result?: ChatRunResult;
  error?: string;
}
