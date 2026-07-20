import { tool } from "langchain";
import { z } from "zod";
import { evaluate } from "mathjs";

export const calculatorTool = tool(
  async ({ expression }: { expression: string }) => {
    try {
      const result = evaluate(expression);
      return { expression, result: String(result) };
    } catch {
      return { expression, error: "Could not evaluate that expression." };
    }
  },
  {
    name: "calculator",
    description:
      "Evaluate a math expression (arithmetic, percentages, powers, roots, trig, unit conversions). Use this for any calculation instead of computing it yourself.",
    schema: z.object({
      expression: z
        .string()
        .describe('A math expression, e.g. "12 * (3 + 4) / 2" or "sqrt(144)"'),
    }),
  },
);
