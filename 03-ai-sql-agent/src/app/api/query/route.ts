import { formatQueryResponse } from "@/lib/ai/agent/format-query-response";
import { createSQLAgent } from "@/lib/ai/agent/sql-agent";
import { resolveDatabaseFile } from "@/lib/database-files";
import { QuerySchema } from "@/lib/validation/query-schema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { question } = QuerySchema.parse(body);
    const databaseName = z.string().min(1).parse(body.databaseName);
    const database = await resolveDatabaseFile(databaseName);

    const agent = await createSQLAgent(database.path);

    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
    });

    const response = formatQueryResponse(result.messages);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("SQL Agent Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid question.",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process your query.",
      },
      {
        status: 500,
      },
    );
  }
}
