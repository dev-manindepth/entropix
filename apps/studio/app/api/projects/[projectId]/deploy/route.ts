import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProject, createDeployment } from "@/lib/db/queries";

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
    const body = await request.json().catch(() => ({}));
    let { slug } = body as { slug?: string };

    const project = await getProject(projectId, userId);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    if (!project.currentSpecJson) {
      return NextResponse.json(
        { error: "Project has no spec to deploy. Generate a UI first." },
        { status: 400 },
      );
    }

    // Auto-generate slug from project name if not provided
    if (!slug) {
      const base = project.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const suffix = Math.random().toString(36).slice(2, 6);
      slug = `${base}-${suffix}`;
    }

    // Validate slug
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && !/^[a-z0-9]{1,2}$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen." },
        { status: 400 },
      );
    }

    if (slug.length < 3 || slug.length > 50) {
      return NextResponse.json(
        { error: "Slug must be between 3 and 50 characters." },
        { status: 400 },
      );
    }

    try {
      const deployment = await createDeployment(
        projectId,
        slug,
        project.currentSpecJson,
        project.name,
      );

      const baseDomain =
        process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost:3002";
      const protocol = baseDomain.includes("localhost") ? "http" : "https";
      const url = `${protocol}://${slug}.${baseDomain}`;

      return NextResponse.json({ id: deployment.id, slug, url });
    } catch (err: unknown) {
      // Check for unique constraint violation (slug already taken)
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("unique") ||
        msg.includes("duplicate") ||
        msg.includes("UNIQUE")
      ) {
        return NextResponse.json(
          { error: `The slug "${slug}" is already taken. Please choose another.` },
          { status: 409 },
        );
      }
      throw err;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/projects/[id]/deploy error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
