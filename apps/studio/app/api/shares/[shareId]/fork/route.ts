import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getShare,
  createProject,
  createGeneration,
  updateProject,
} from "@/lib/db/queries";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to fork" },
        { status: 401 },
      );
    }

    const { shareId } = await params;
    const share = await getShare(shareId);
    if (!share) {
      return NextResponse.json(
        { error: "Share not found" },
        { status: 404 },
      );
    }

    // Create new project from the shared spec
    const project = await createProject(
      userId,
      `Fork: ${share.title || "Shared UI"}`,
    );

    // Set the current spec
    await updateProject(project.id, { currentSpecJson: share.specJson });

    // Create a generation record for the fork
    await createGeneration({
      projectId: project.id,
      turnNumber: 1,
      role: "assistant",
      prompt: null,
      specJson: share.specJson,
      rawResponse: null,
      promptTokens: 0,
      completionTokens: 0,
    });

    return NextResponse.json({ projectId: project.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/shares/[shareId]/fork error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
