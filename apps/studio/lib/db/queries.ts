import { eq, asc, desc, count } from "drizzle-orm";
import { db } from "./index";
import { projects, generations } from "./schema";
import { createId } from "../nanoid";

/* ─── Projects ─── */

export function getProjects() {
  return db.select().from(projects).orderBy(desc(projects.updatedAt)).all();
}

export function getProject(id: string) {
  return db.select().from(projects).where(eq(projects.id, id)).get();
}

export function createProject(name: string, description?: string) {
  const id = createId();
  const now = new Date();
  db.insert(projects)
    .values({ id, name, description: description ?? null, currentSpecJson: null, createdAt: now, updatedAt: now })
    .run();
  return getProject(id)!;
}

export function updateProject(
  id: string,
  data: { name?: string; description?: string; currentSpecJson?: string },
) {
  db.update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .run();
  return getProject(id);
}

export function deleteProject(id: string) {
  db.delete(projects).where(eq(projects.id, id)).run();
}

/* ─── Generations ─── */

export function getGenerations(projectId: string) {
  return db
    .select()
    .from(generations)
    .where(eq(generations.projectId, projectId))
    .orderBy(asc(generations.turnNumber), asc(generations.createdAt))
    .all();
}

export function createGeneration(data: {
  projectId: string;
  turnNumber: number;
  role: "user" | "assistant";
  prompt: string | null;
  specJson: string | null;
  rawResponse: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
}) {
  const id = createId();
  db.insert(generations)
    .values({ id, ...data, createdAt: new Date() })
    .run();
  return db.select().from(generations).where(eq(generations.id, id)).get()!;
}

export function getNextTurnNumber(projectId: string) {
  const result = db
    .select({ total: count() })
    .from(generations)
    .where(eq(generations.projectId, projectId))
    .get();
  const total = result?.total ?? 0;
  return Math.floor(total / 2) + 1;
}
