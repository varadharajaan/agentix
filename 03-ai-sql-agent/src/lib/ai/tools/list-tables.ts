import { tool } from "langchain";

import { getTables } from "@/lib/db";
import { ListTablesResult } from "@/types/tools";

export function createListTablesTool(databasePath?: string) {
  return tool(
  async (): Promise<ListTablesResult> => {
    try {
      const tables = getTables(databasePath);

      return {
        success: true,
        tables,
        count: tables.length,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve database tables.",
      };
    }
  },
  {
    name: "list_tables",

    description: `
List all available tables in the SQLite database.

Use this tool at the start of a conversation to discover the database structure before inspecting schemas or generating SQL.
`,
  },
  );
}
