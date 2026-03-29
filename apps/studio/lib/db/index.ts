import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

export const db = drizzle(sql, { schema });

/**
 * Initialize database tables if they don't exist.
 * Called on first request in production.
 */
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      current_spec_json TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      turn_number INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      prompt TEXT,
      spec_json TEXT,
      raw_response TEXT,
      prompt_tokens INTEGER,
      completion_tokens INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
}
