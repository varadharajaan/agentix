import { AIMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";

import { QueryResponse } from "@/types/agent";
import { ExecuteSQLResult } from "@/types/tools";

function getExplanation(message: AIMessage): string {
  if (typeof message.content === "string") {
    return message.content.trim();
  }

  if (Array.isArray(message.content)) {
    return message.content
      .flatMap((part) =>
        typeof part === "object" && part !== null && "text" in part
          ? String(part.text)
          : [],
      )
      .join("\n")
      .trim();
  }

  return "";
}

function parseToolResult<T>(message: ToolMessage): T | undefined {
  if (typeof message.content !== "string") {
    return undefined;
  }

  try {
    return JSON.parse(message.content) as T;
  } catch {
    return undefined;
  }
}

export function formatQueryResponse(messages: BaseMessage[]): QueryResponse {
  let sql = "";
  let rows: Record<string, unknown>[] = [];
  let rowCount = 0;
  let explanation = "";

  for (const message of messages) {
    if (message instanceof ToolMessage && message.name === "execute_sql") {
      const result = parseToolResult<ExecuteSQLResult>(message);

      if (result?.success) {
        sql = result.sql;
        rows = result.rows;
        rowCount = result.rowCount;
      }

      continue;
    }

    if (message instanceof AIMessage) {
      // Skip intermediate AI messages that request tool calls.
      if ((message.tool_calls?.length ?? 0) > 0) {
        continue;
      }

      explanation = getExplanation(message);
    }
  }

  return {
    sql,
    rows,
    rowCount,
    explanation,
  };
}
