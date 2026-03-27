import { NextResponse } from "next/server";
import { refineUI, createAnthropicAdapter } from "@entropix/ai/generate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentSpec, instruction } = body as {
      currentSpec: unknown;
      instruction: string;
    };

    if (!currentSpec || !instruction) {
      return NextResponse.json(
        { error: "currentSpec and instruction are required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not set. Add it to .env.local" },
        { status: 500 },
      );
    }

    const adapter = createAnthropicAdapter({ apiKey });

    const result = await refineUI({
      currentSpec: currentSpec as any,
      instruction,
      adapter,
      contextMode: "compact",
      maxTokens: 8192,
    });

    return NextResponse.json({
      spec: result.spec,
      validation: result.validation,
      usage: result.usage,
      raw: result.raw,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Refine error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
