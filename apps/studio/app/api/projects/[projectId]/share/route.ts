import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProject, createShare } from "@/lib/db/queries";

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

    const project = await getProject(projectId, userId);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    if (!project.currentSpecJson) {
      return NextResponse.json(
        { error: "Project has no spec to share. Generate a UI first." },
        { status: 400 },
      );
    }

    const share = await createShare(projectId, project.currentSpecJson, project.name);

    const baseDomain =
      process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost:3002";
    const protocol = baseDomain.includes("localhost") ? "http" : "https";
    const url = `${protocol}://${baseDomain}/s/${share.id}`;

    return NextResponse.json({ id: share.id, url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/projects/[id]/share error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
