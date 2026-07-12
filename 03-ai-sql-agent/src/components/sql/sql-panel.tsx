import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "./code-block";

type SQLPanelProps = {
  sql: string;
};

export default function SQLPanel({ sql }: SQLPanelProps) {
  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Generated SQL</CardTitle>

        <Badge variant="secondary">SQL</Badge>
      </CardHeader>

      <CardContent>
        {sql ? (
          <CodeBlock code={sql} language="sql" />
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            The generated SQL query will appear here.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
