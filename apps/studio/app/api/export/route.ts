import { NextResponse } from "next/server";
import { specToCode } from "@entropix/ai/generate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { spec, format, componentName } = body as {
      spec: unknown;
      format?: "component" | "page";
      componentName?: string;
    };

    if (!spec) {
      return NextResponse.json({ error: "spec is required" }, { status: 400 });
    }

    const result = specToCode({
      spec: spec as any,
      format: format ?? "page",
      componentName,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Export error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
