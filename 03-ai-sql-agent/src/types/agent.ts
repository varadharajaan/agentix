export interface QueryResponse {
  sql: string;
  rows: Record<string, unknown>[];
  rowCount: number;
  explanation: string;
}
