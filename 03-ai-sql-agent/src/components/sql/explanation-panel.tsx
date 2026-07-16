import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ExplanationPanelProps = {
  answer: string;
};

export default function ExplanationPanel({ answer }: ExplanationPanelProps) {
  return (
    <div className="mt-4">
      <h2 className="font-bold text-xl">AI Explanation</h2>

      <p className="text-sm text-muted-foreground mt-1 mb-4">
        A natural language summary of the query results.
      </p>

      <div>
        {answer ? (
          <p className="text-sm leading-7 text-muted-foreground whitespace-pre-wrap">
            {answer}
          </p>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm">
            The AI explanation will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
