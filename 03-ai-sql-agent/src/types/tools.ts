import { TableColumn } from "./database";

export interface ExecuteSQLSuccess {
  success: true;
  sql: string;
  rows: Record<string, unknown>[];
  rowCount: number;
}

export interface ExecuteSQLFailure {
  success: false;
  sql: string;
  error: string;
}

export type ExecuteSQLResult = ExecuteSQLSuccess | ExecuteSQLFailure;

export type GetSchemaResult =
  | {
      success: true;
      table: string;
      columns: TableColumn[];
    }
  | {
      success: false;
      table: string;
      error: string;
    };

export interface ListTablesSuccess {
  success: true;
  tables: string[];
  count: number;
}

export interface ListTablesFailure {
  success: false;
  error: string;
}

export type ListTablesResult = ListTablesSuccess | ListTablesFailure;
