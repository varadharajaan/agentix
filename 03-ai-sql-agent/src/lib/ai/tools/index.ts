import { createExecuteSQLTool } from "./execute-sql";
import { createGetSchemaTool } from "./get-schema";
import { createListTablesTool } from "./list-tables";

export function createSQLAgentTools(databasePath?: string) {
  return [
    createListTablesTool(databasePath),
    createGetSchemaTool(databasePath),
    createExecuteSQLTool(databasePath),
  ];
}
