import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  currentSpecJson: text("current_spec_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const generations = pgTable("generations", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  turnNumber: integer("turn_number").notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  prompt: text("prompt"),
  specJson: text("spec_json"),
  rawResponse: text("raw_response"),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
