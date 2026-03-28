import { NextResponse } from "next/server";
import { getProjects, createProject } from "@/lib/db/queries";

export async function GET() {
  try {
    const projects = getProjects();
    return NextResponse.json({ projects });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/projects error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body as {
      name: string;
      description?: string;
    };

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 },
      );
    }

    const project = createProject(name, description);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/projects error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
