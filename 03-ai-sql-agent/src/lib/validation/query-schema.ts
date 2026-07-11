import { z } from "zod";

export const QuerySchema = z.object({
  question: z.string().trim().min(1, "Question is required."),
});

export type QueryInput = z.infer<typeof QuerySchema>;
