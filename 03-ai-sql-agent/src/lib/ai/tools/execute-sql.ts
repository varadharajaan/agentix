import { tool } from "langchain";
import { z } from "zod";

import { executeQuery } from "@/lib/db";
import { validateSQL } from "@/lib/sql-validator";
import { ExecuteSQLResult } from "@/types/tools";

export function createExecuteSQLTool(databasePath?: string) {
  return tool(
  async ({ sql }): Promise<ExecuteSQLResult> => {
    try {
      const safeSQL = validateSQL(sql);

      const rows = executeQuery(safeSQL, databasePath);

      return {
        success: true,
        sql: safeSQL,
        rows,
        rowCount: rows.length,
      };
    } catch (error) {
      return {
        success: false,
        sql,
        error:
          error instanceof Error ? error.message : "Unknown error occurred.",
      };
    }
  },
  {
    name: "execute_sql",

    description: `
Execute a read-only SQLite SELECT query.

Only use this tool after you have inspected the required table schemas and generated a valid SQL query.

This tool only supports SELECT statements.
`,

    schema: z.object({
      sql: z.string().describe("The SQLite SELECT query to execute."),
    }),
  },
  );
}
