import { eq, asc, desc, count } from "drizzle-orm";
import { db, initDb } from "./index";
import { projects, generations, shares, deployments } from "./schema";
import { createId } from "../nanoid";

let initialized = false;

async function ensureDb() {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
}

/* ─── Projects ─── */

export async function getProjects() {
  await ensureDb();
  return db.select().from(projects).orderBy(desc(projects.updatedAt));
}

export async function getProject(id: string) {
  await ensureDb();
  const rows = await db.select().from(projects).where(eq(projects.id, id));
  return rows[0] ?? null;
}

export async function createProject(name: string, description?: string) {
  await ensureDb();
  const id = createId();
  const now = new Date();
  await db.insert(projects).values({
    id,
    name,
    description: description ?? null,
    currentSpecJson: null,
    createdAt: now,
    updatedAt: now,
  });
  return (await getProject(id))!;
}

export async function updateProject(
  id: string,
  data: { name?: string; description?: string; currentSpecJson?: string },
) {
  await ensureDb();
  await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id));
  return getProject(id);
}

export async function deleteProject(id: string) {
  await ensureDb();
  await db.delete(generations).where(eq(generations.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));
}

/* ─── Generations ─── */

export async function getGenerations(projectId: string) {
  await ensureDb();
  return db
    .select()
    .from(generations)
    .where(eq(generations.projectId, projectId))
    .orderBy(asc(generations.turnNumber), asc(generations.createdAt));
}

export async function createGeneration(data: {
  projectId: string;
  turnNumber: number;
  role: "user" | "assistant";
  prompt: string | null;
  specJson: string | null;
  rawResponse: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
}) {
  await ensureDb();
  const id = createId();
  await db.insert(generations).values({ id, ...data, createdAt: new Date() });
  const rows = await db
    .select()
    .from(generations)
    .where(eq(generations.id, id));
  return rows[0]!;
}

export async function getNextTurnNumber(projectId: string) {
  await ensureDb();
  const result = await db
    .select({ total: count() })
    .from(generations)
    .where(eq(generations.projectId, projectId));
  const total = result[0]?.total ?? 0;
  return Math.floor(total / 2) + 1;
}

/* ─── Shares ─── */

export async function createShare(projectId: string, specJson: string, title?: string) {
  await ensureDb();
  const id = createId();
  await db.insert(shares).values({
    id,
    projectId,
    specJson,
    title: title ?? null,
    createdAt: new Date(),
  });
  const rows = await db.select().from(shares).where(eq(shares.id, id));
  return rows[0]!;
}

export async function getShare(id: string) {
  await ensureDb();
  const rows = await db.select().from(shares).where(eq(shares.id, id));
  return rows[0] ?? null;
}

export async function getProjectShares(projectId: string) {
  await ensureDb();
  return db.select().from(shares).where(eq(shares.projectId, projectId)).orderBy(desc(shares.createdAt));
}

/* ─── Deployments ─── */

export async function createDeployment(projectId: string, slug: string, specJson: string, title?: string) {
  await ensureDb();
  const id = createId();
  await db.insert(deployments).values({
    id,
    projectId,
    slug,
    specJson,
    title: title ?? null,
    createdAt: new Date(),
  });
  const rows = await db.select().from(deployments).where(eq(deployments.id, id));
  return rows[0]!;
}

export async function getDeploymentBySlug(slug: string) {
  await ensureDb();
  const rows = await db.select().from(deployments).where(eq(deployments.slug, slug));
  return rows[0] ?? null;
}

export async function getProjectDeployments(projectId: string) {
  await ensureDb();
  return db.select().from(deployments).where(eq(deployments.projectId, projectId)).orderBy(desc(deployments.createdAt));
}
