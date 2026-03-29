import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateUI, refineUI } from "@entropix/ai/generate";
import { getAdapter } from "@/lib/ai";
import {
  getProject,
  updateProject,
  createGeneration,
  getNextTurnNumber,
} from "@/lib/db/queries";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const { prompt } = (await request.json()) as { prompt: string };

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 },
      );
    }

    const project = await getProject(projectId, userId);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    const adapter = getAdapter();
    const turnNumber = await getNextTurnNumber(projectId);

    let result;
    if (!project.currentSpecJson) {
      // First turn -- generate from scratch
      result = await generateUI({
        prompt,
        adapter,
        contextMode: "compact",
        maxTokens: 8192,
      });
    } else {
      // Refinement -- send current spec + instruction
      const currentSpec = JSON.parse(project.currentSpecJson);
      result = await refineUI({
        currentSpec,
        instruction: prompt,
        adapter,
        contextMode: "compact",
        maxTokens: 8192,
      });
    }

    // Insert user message
    await createGeneration({
      projectId,
      turnNumber,
      role: "user",
      prompt,
      specJson: null,
      rawResponse: null,
      promptTokens: null,
      completionTokens: null,
    });

    // Insert assistant message
    await createGeneration({
      projectId,
      turnNumber,
      role: "assistant",
      prompt: null,
      specJson: JSON.stringify(result.spec),
      rawResponse: result.raw,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
    });

    // Update project's current spec
    await updateProject(projectId, {
      currentSpecJson: JSON.stringify(result.spec),
    });

    return NextResponse.json({
      spec: result.spec,
      validation: result.validation,
      usage: result.usage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/projects/[id]/generations error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
