import { NextResponse } from "next/server";
import { generateUI, createAnthropicAdapter } from "@entropix/ai/generate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, categories } = body as {
      prompt: string;
      categories?: string[];
    };

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // API key from server env — never exposed to browser
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not set. Add it to .env.local" },
        { status: 500 },
      );
    }

    const adapter = createAnthropicAdapter({ apiKey });

    const result = await generateUI({
      prompt,
      adapter,
      contextMode: categories?.length ? "category" : "compact",
      categories: categories as import("@entropix/ai").ComponentCategory[] | undefined,
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
    console.error("Generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
