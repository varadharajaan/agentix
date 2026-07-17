/**
 * Shared types for the long-term memory system.
 *
 * A `Memory` is a durable, structured fact about the user (see store.ts for
 * persistence and retrieval.ts / extraction.ts for how memories are found
 * and written). `MemoryEvent` is the streaming protocol used by
 * /api/memories/extract so the UI can show memory operations live, the same
 * way the research project streams its progress events.
 */

export type MemoryType = "preference" | "goal" | "project" | "constraint";
export type Confidence = "low" | "medium" | "high";

export interface Memory {
  id: string;
  userId: string;
  type: MemoryType;
  content: string;
  confidence: Confidence;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type MemoryEvent =
  | { type: "operation"; op: "create" | "update" | "forget"; memory: Memory }
  | { type: "done"; memories: Memory[] }
  | { type: "error"; message: string };
