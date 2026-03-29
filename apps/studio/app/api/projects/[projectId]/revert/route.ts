import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProject, updateProject } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { generations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    const { generationId } = await request.json();

    const project = await getProject(projectId, userId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch the generation
    const rows = await db
      .select()
      .from(generations)
      .where(eq(generations.id, generationId));
    const gen = rows[0];
    if (!gen || gen.projectId !== projectId || !gen.specJson) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 },
      );
    }

    // Update project's current spec to this generation's spec
    await updateProject(projectId, { currentSpecJson: gen.specJson });

    return NextResponse.json({ spec: JSON.parse(gen.specJson) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/projects/[id]/revert error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
