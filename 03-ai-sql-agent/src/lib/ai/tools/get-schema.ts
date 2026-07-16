import { tool } from "langchain";
import { z } from "zod";

import { getTableSchema } from "@/lib/db";
import { GetSchemaResult } from "@/types/tools";

export function createGetSchemaTool(databasePath?: string) {
  return tool(
  async ({ table }): Promise<GetSchemaResult> => {
    try {
      const columns = getTableSchema(table, databasePath);

      return {
        success: true,
        table,
        columns,
      };
    } catch (error) {
      return {
        success: false,
        table,
        error:
          error instanceof Error ? error.message : "Unknown error occurred.",
      };
    }
  },
  {
    name: "get_schema",

    description: `
Retrieve the schema for a SQLite table.

Use this tool whenever you need to inspect a table before generating SQL.

Always inspect a table's schema before referencing its columns.
`,

    schema: z.object({
      table: z.string().min(1).describe("The name of the SQLite table."),
    }),
  },
  );
}
