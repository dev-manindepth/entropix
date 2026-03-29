# Entropix Studio -- Implementation Guide

This document teaches you how to think about and write code in the Studio app. It covers the end-to-end user journey, how to add features, the database layer, authentication, sharing/deployment, templates, and debugging.

---

## 1. How the Studio Works End-to-End

The full user journey:

```
Sign up (Clerk)
  -> Create project (POST /api/projects)
  -> Type prompt ("Create a pricing page")
  -> Claude generates UISpec (POST /api/projects/[id] with generate action)
  -> Spec saved to DB (generations table + projects.currentSpecJson)
  -> Preview renders via EntropixRenderer
  -> User refines via chat ("Make the buttons bigger")
  -> Updated spec saved (new generation row)
  -> Share (creates snapshot in shares table)
  -> Deploy (creates deployment with slug for subdomain routing)
```

### Technology Stack

- **Framework**: Next.js (App Router)
- **Auth**: Clerk (middleware + `auth()` helper)
- **Database**: PostgreSQL via Neon + Drizzle ORM
- **AI**: `@entropix/ai` package (generateUI / refineUI)
- **Rendering**: `EntropixRenderer` from `@entropix/ai`
- **Hosting**: Vercel

---

## 2. How to Add a New Feature to Studio

Walk through adding a hypothetical "Favorites" feature.

### Step 1: Database -- add a column

In `lib/db/schema.ts`:

```tsx
export const projects = pgTable("projects", {
  // ... existing columns
  favorite: boolean("favorite").notNull().default(false),  // NEW
});
```

In `lib/db/index.ts`, add the migration to `initDb()`:

```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS favorite BOOLEAN NOT NULL DEFAULT false;
```

The `IF NOT EXISTS` / `IF NOT EXISTS` pattern means this is safe to run on existing databases.

### Step 2: Database query

In `lib/db/queries.ts`, add a query and update function:

```tsx
export async function getFavoriteProjects(userId: string) {
  await ensureDb();
  return db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.favorite, true)))
    .orderBy(desc(projects.updatedAt));
}

export async function toggleFavorite(id: string, userId: string) {
  await ensureDb();
  const project = await getProject(id, userId);
  if (!project) return null;
  await db
    .update(projects)
    .set({ favorite: !project.favorite, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)));
  return getProject(id, userId);
}
```

### Step 3: API route

Create `app/api/projects/[projectId]/favorite/route.ts`:

```tsx
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { toggleFavorite } from "@/lib/db/queries";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const project = await toggleFavorite(projectId, userId);

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("PATCH favorite error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### Step 4: UI -- star icon in project card

In the project card component, add a toggle button:

```tsx
const handleToggleFavorite = async () => {
  await fetch(`/api/projects/${project.id}/favorite`, { method: "PATCH" });
  // Refresh project list
};

<button onClick={handleToggleFavorite} aria-label="Toggle favorite">
  {project.favorite ? "★" : "☆"}
</button>
```

### Step 5: Sidebar filter

Add a "Favorites" section to the sidebar that calls `getFavoriteProjects()`.

---

## 3. How to Add a New API Route

Every API route follows this pattern:

```tsx
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function METHOD(request: Request) {
  try {
    // 1. Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse input (for POST/PATCH/PUT)
    const body = await request.json();

    // 3. Validate input
    if (!body.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // 4. Database operation
    const result = await someQuery(userId, body.name);

    // 5. Return response
    return NextResponse.json({ result }, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

**Key rules:**
- Always call `auth()` first and check for `userId`
- Always scope database queries by `userId`
- Always wrap in try/catch with error logging
- Always return structured JSON with appropriate status codes
- Use `await params` for dynamic route segments (Next.js 15 pattern)

---

## 4. How the Database Works

### ORM: Drizzle with @vercel/postgres

```tsx
// lib/db/index.ts
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

export const db = drizzle(sql, { schema });
```

### Auto-Migration via initDb()

Instead of migration files, the studio uses `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements. This is called on first request:

```tsx
let initialized = false;

async function ensureDb() {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
}
```

Every query function calls `ensureDb()` first. This pattern works well for serverless (Vercel) where the module may be re-initialized on cold starts.

### Schema

Four tables:

```
projects
  id (PK), userId, name, description, currentSpecJson, createdAt, updatedAt

generations
  id (PK), projectId (FK -> projects), turnNumber, role (user/assistant),
  prompt, specJson, rawResponse, promptTokens, completionTokens, createdAt

shares
  id (PK), projectId (FK -> projects), specJson, title, createdAt

deployments
  id (PK), projectId (FK -> projects), slug (unique), specJson, title, createdAt
```

**Cascade deletes:** Deleting a project cascades to generations, shares, and deployments.

**IDs:** Generated via `createId()` from `lib/nanoid.ts` (nanoid-based).

### Query Patterns

All queries are in `lib/db/queries.ts`. Common patterns:

```tsx
// List with user scoping
export async function getProjects(userId: string) {
  await ensureDb();
  return db.select().from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.updatedAt));
}

// Get single with ownership check
export async function getProject(id: string, userId?: string) {
  await ensureDb();
  const conditions = userId
    ? and(eq(projects.id, id), eq(projects.userId, userId))
    : eq(projects.id, id);
  const rows = await db.select().from(projects).where(conditions);
  return rows[0] ?? null;
}

// Create with generated ID
export async function createProject(userId: string, name: string) {
  await ensureDb();
  const id = createId();
  await db.insert(projects).values({ id, userId, name, ... });
  return (await getProject(id))!;
}
```

---

## 5. How Auth Works

### Clerk Middleware

Clerk middleware runs on every request and protects the `/(app)` route group. Public routes (sign-in, sign-up, share pages, deployed pages) are excluded.

### API Route Auth

Every API route calls `auth()` from `@clerk/nextjs/server`:

```tsx
const { userId } = await auth();
if (!userId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### User Scoping

All database queries that return user data are scoped by `userId`:

```tsx
const projects = await getProjects(userId);  // Only this user's projects
const project = await getProject(id, userId);  // Returns null if not owned
```

This ensures users can never access each other's data, even if they guess an ID.

---

## 6. How Share/Deploy Works

### Share Flow

```
User clicks "Share" button
  -> POST /api/shares { projectId, specJson, title }
  -> Creates row in shares table with unique ID
  -> Returns share URL: /s/{shareId}
  -> Share page (app/s/[shareId]/page.tsx) loads spec from DB
  -> ShareRenderer renders the spec with EntropixRenderer
```

Shares are **snapshots** -- they capture the spec at a point in time. Editing the project does not change existing shares.

### Deploy Flow

```
User clicks "Deploy" button
  -> User enters a slug (e.g., "my-pricing-page")
  -> POST /api/projects/[id] with deploy action
  -> Creates row in deployments table with unique slug
  -> Returns deploy URL: {slug}.designtodeployment.com
  -> Deployed page (app/deployed/[slug]/page.tsx) loads spec by slug
  -> ShareRenderer renders the spec
```

Deployments use subdomain routing. The slug becomes the subdomain, configured via `NEXT_PUBLIC_BASE_DOMAIN` environment variable.

### The Deployed Page

```tsx
// app/deployed/[slug]/page.tsx
export default async function DeployedPage({ params }) {
  const { slug } = await params;
  const deployment = await getDeploymentBySlug(slug);

  if (!deployment) {
    return <div>Page not found</div>;
  }

  const spec = JSON.parse(deployment.specJson) as UISpec;
  return <ShareRenderer spec={spec} title={deployment.title ?? "Untitled"} />;
}
```

---

## 7. How to Add a New Template

Templates are pre-defined prompts that generate common UI patterns.

### Step 1: Add to lib/templates.ts

```tsx
export const TEMPLATES: Template[] = [
  // ... existing templates
  {
    id: "blog",
    name: "Blog Layout",
    icon: "📝",
    description: "Article list with sidebar and categories",
    prompt:
      "Create a blog layout with: a header with site title and navigation links; " +
      "a sidebar with category list (Technology, Design, Business) and recent posts; " +
      "a main content area with 3 article cards each with title, excerpt, author, " +
      "date, and Read More link; and a footer with copyright.",
  },
];
```

### Step 2: That is it

The template list is rendered from `TEMPLATES`. When a user selects a template, the `prompt` is sent to `generateUI()` as if the user typed it.

### Tips for Good Templates

- Be specific with numbers: "4 stat cards" not "some stat cards"
- Include sample data: "Total Revenue $45,200" not "a revenue metric"
- Describe layout structure: "a sidebar with ... a main content area with ..."
- Mention specific components when you want them: "a data table with columns"
- Keep prompts under 500 characters for best results

---

## 8. How the Generation Conversation Works

The chat is stored as alternating user/assistant rows in the `generations` table:

```
Turn 1: role=user,      prompt="Create a pricing page"
Turn 1: role=assistant,  specJson="{...}", rawResponse="..."

Turn 2: role=user,      prompt="Make the buttons larger"
Turn 2: role=assistant,  specJson="{...}", rawResponse="..."
```

- Turn 1 uses `generateUI()` (fresh generation)
- Turn 2+ uses `refineUI()` (takes current spec + instruction)
- The current spec is always saved to `projects.currentSpecJson`
- Token usage is tracked per generation for monitoring

The `getNextTurnNumber()` function calculates the next turn:

```tsx
export async function getNextTurnNumber(projectId: string) {
  const result = await db.select({ total: count() }).from(generations)
    .where(eq(generations.projectId, projectId));
  return Math.floor((result[0]?.total ?? 0) / 2) + 1;
}
```

---

## 9. How to Debug Common Issues

### Generation fails or returns garbage

1. Check `ANTHROPIC_API_KEY` is set in Vercel environment variables
2. Check the `rawResponse` in the generations table -- is it valid JSON?
3. Check if the response was truncated (look for incomplete JSON)
4. Try a simpler prompt to isolate the issue

### Deploy URL does not work

1. Check `NEXT_PUBLIC_BASE_DOMAIN` environment variable
2. Verify the slug exists in the deployments table
3. Check Vercel domain configuration for wildcard subdomains
4. Make sure the deployed route (`app/deployed/[slug]`) is not in the Clerk middleware protected routes

### Database errors

1. Check the Neon connection string in Vercel environment variables (`POSTGRES_URL`)
2. Run `initDb()` manually to check for SQL errors
3. Check if the table schema matches what the code expects (new columns added?)
4. Verify the Neon project is not paused (free tier pauses after inactivity)

### Build fails

1. Check the Root Directory setting in Vercel dashboard (should be `apps/studio`)
2. Run `pnpm build` locally from the studio directory
3. Check for TypeScript errors: `pnpm typecheck`
4. Check for lint errors: `pnpm lint`

### Preview does not render

1. Check browser console for React errors
2. Verify the spec JSON is valid: paste into a JSON validator
3. Check if all components in the spec are in the component map
4. Look for `Unknown component` error boxes in the preview -- these show unregistered components

---

## 10. Project Structure

```
apps/studio/
  app/
    (app)/              -- Protected routes (requires auth)
      page.tsx          -- Dashboard / project list
      [projectId]/      -- Project editor page
    api/
      projects/         -- CRUD for projects + generate/refine
      shares/           -- Create/read shares
      export/           -- Code export endpoint
    deployed/[slug]/    -- Public deployed pages
    s/[shareId]/        -- Public share pages
    sign-in/            -- Clerk sign-in page
    sign-up/            -- Clerk sign-up page
    layout.tsx          -- Root layout with Clerk provider
    globals.css         -- Global styles + Entropix token CSS
  lib/
    db/
      index.ts          -- Drizzle client + initDb()
      schema.ts         -- Table definitions
      queries.ts        -- All database queries
    ai.ts               -- AI adapter configuration
    components-map.ts   -- React component map for EntropixRenderer
    templates.ts        -- Template definitions
    layout-context.tsx  -- Client-side layout state
    nanoid.ts           -- ID generation
```

---

## 11. Environment Variables

Required for the studio to function:

```
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Database (Neon via Vercel Postgres)
POSTGRES_URL=postgresql://...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Deployment
NEXT_PUBLIC_BASE_DOMAIN=designtodeployment.com
```

All are configured in the Vercel dashboard, not in `.env` files committed to the repo.
