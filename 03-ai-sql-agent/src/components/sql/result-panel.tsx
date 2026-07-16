import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ResultsPanelProps = {
  rows: Record<string, unknown>[];
  rowCount: number;
  databaseName: string;
};

export default function ResultsPanel({ rows, rowCount, databaseName }: ResultsPanelProps) {
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Query Results</CardTitle>

        <p className="text-sm text-muted-foreground">
          Results returned from the local SQLite database.
        </p>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            <strong>Rows:</strong> {rowCount}
          </span>

          <span>
            <strong>Database:</strong> {databaseName}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Query results will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column}>
                        {String(row[column] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
