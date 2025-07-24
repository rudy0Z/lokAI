import { NextResponse } from "next/server";
import { indianLegalChatChain } from "@/lib/indian-legal-chain";

export async function POST(req: Request) {
  try {
    const { message, city, language, context, sessionId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Use the enhanced Indian Legal Chat Chain
    const result = await indianLegalChatChain.processQuery(
      message,
      sessionId || `session_${Date.now()}`,
      {
        city,
        language: language || "English",
        documentContext: context
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        response: result.response,
        suggestions: result.suggestions,
        actions: [],
        topics: result.topics,
        relevantLaws: result.relevantLaws
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to get response from AI" },
      { status: 500 }
    );
  }
}
