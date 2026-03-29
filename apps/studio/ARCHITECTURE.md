# Entropix Studio -- Architecture

## 1. What is Entropix Studio

Entropix Studio is a prompt-to-UI product in the style of v0.dev and Lovable. Any
stakeholder -- designer, PM, engineer, founder -- types a natural-language prompt
and receives a fully working UI built entirely from the Entropix design system.
The generated interface renders live in the browser, can be refined through
multi-turn conversation, shared via public link, deployed to a custom subdomain,
or exported as copy-pasteable React code.

Production URL: **https://designtodeployment.com**

Deployed UIs are served on wildcard subdomains: `{slug}.designtodeployment.com`.


## 2. Tech Stack

| Layer             | Technology                                                 |
|-------------------|------------------------------------------------------------|
| Framework         | Next.js 16.1.5 (App Router, React 19, Turbopack)          |
| Authentication    | Clerk (`@clerk/nextjs` v6)                                 |
| Database          | Neon Postgres via `@vercel/postgres` + Drizzle ORM 0.40    |
| AI Generation     | `@entropix/ai` (wraps Anthropic Claude API)                |
| UI Components     | `@entropix/react`, `@entropix/core`, `@entropix/data`     |
| Design Tokens     | `@entropix/tokens`                                         |
| Hosting           | Vercel (auto-deploy from monorepo)                         |
| Domain            | `designtodeployment.com` with `*.designtodeployment.com` wildcard DNS |
| Language          | TypeScript 5.9                                             |
| Package Manager   | pnpm (workspace monorepo)                                  |
| IDs               | nanoid (12-char default)                                   |


## 3. Database Schema

Four tables in Neon Postgres, defined in `lib/db/schema.ts` using Drizzle ORM.

### projects

Stores per-user projects. `currentSpecJson` holds the latest UISpec JSON so the
preview always reflects the most recent generation or revert.

| Column            | Type      | Notes                                 |
|-------------------|-----------|---------------------------------------|
| id                | TEXT PK   | nanoid                                |
| user_id           | TEXT      | Clerk user ID, NOT NULL, default `'anonymous'` |
| name              | TEXT      | NOT NULL                              |
| description       | TEXT      | nullable                              |
| current_spec_json | TEXT      | nullable; the live UISpec JSON        |
| created_at        | TIMESTAMP | default NOW()                         |
| updated_at        | TIMESTAMP | default NOW(), bumped on every write  |

### generations

Append-only log of every chat message (user prompts and assistant responses).
Each turn creates two rows: one `role='user'` with the prompt, one
`role='assistant'` with the generated spec and token usage.

| Column            | Type      | Notes                                 |
|-------------------|-----------|---------------------------------------|
| id                | TEXT PK   | nanoid                                |
| project_id        | TEXT FK   | references projects(id) ON DELETE CASCADE |
| turn_number       | INTEGER   | groups user+assistant pairs           |
| role              | TEXT      | `'user'` or `'assistant'`             |
| prompt            | TEXT      | user prompt (user rows only)          |
| spec_json         | TEXT      | generated UISpec JSON (assistant rows) |
| raw_response      | TEXT      | raw LLM response                     |
| prompt_tokens     | INTEGER   | token count from API                  |
| completion_tokens | INTEGER   | token count from API                  |
| created_at        | TIMESTAMP | default NOW()                         |

### shares

Point-in-time snapshots for public sharing. Each share captures the spec at the
moment of creation, so further edits to the project do not change the shared link.

| Column     | Type      | Notes                                      |
|------------|-----------|--------------------------------------------|
| id         | TEXT PK   | nanoid (used in `/s/{id}` URL)             |
| project_id | TEXT FK   | references projects(id) ON DELETE CASCADE  |
| spec_json  | TEXT      | NOT NULL; frozen spec snapshot             |
| title      | TEXT      | nullable; defaults to project name         |
| created_at | TIMESTAMP | default NOW()                              |

### deployments

Custom-subdomain deployments. The `slug` column has a unique index and maps
directly to `{slug}.designtodeployment.com`.

| Column     | Type      | Notes                                      |
|------------|-----------|--------------------------------------------|
| id         | TEXT PK   | nanoid                                     |
| project_id | TEXT FK   | references projects(id) ON DELETE CASCADE  |
| slug       | TEXT      | NOT NULL, UNIQUE INDEX; subdomain prefix   |
| spec_json  | TEXT      | NOT NULL; frozen spec snapshot             |
| title      | TEXT      | nullable                                   |
| created_at | TIMESTAMP | default NOW()                              |

### Database initialization

`lib/db/index.ts` exports an `initDb()` function that runs `CREATE TABLE IF NOT
EXISTS` statements and an idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
for the `user_id` column. This runs once per cold start via the `ensureDb()`
guard in `lib/db/queries.ts`.


## 4. Authentication

Clerk handles all auth. The integration consists of:

**Middleware** (`middleware.ts`):
- Uses `clerkMiddleware` with a `createRouteMatcher` for public routes.
- Runs _before_ auth to detect wildcard subdomains (see section 8).
- Calls `auth.protect()` on any route that is not public.

**Public routes** (no auth required):
- `/sign-in(.*)`, `/sign-up(.*)` -- Clerk hosted UI pages
- `/s/(.*)` -- shared spec viewer
- `/deployed/(.*)` -- deployed site renderer
- `/api/export(.*)` -- code export endpoint

**Protected routes** (require signed-in user):
- `/(app)/*` -- all studio UI pages (project list, workspace)
- `/api/projects/*` -- all project CRUD and generation endpoints
- `/api/shares/*/fork` -- forking a shared spec into own project

**User scoping**: every API route handler calls `auth()` to obtain `userId`.
All project queries are scoped by `userId` via Drizzle `where` clauses, ensuring
complete data isolation between users.


## 5. Generation Pipeline

The core loop: user sends a prompt, the server calls Claude, and the response is
rendered live in the preview panel.

### Request flow

```
User types prompt in ChatPanel
  -> POST /api/projects/{projectId}/generations
     -> auth().userId check
     -> getProject(projectId, userId) -- ownership check
     -> getNextTurnNumber(projectId) -- calculates turn from row count
     -> Branch:
        - No currentSpecJson (first turn):
            generateUI({ prompt, adapter, contextMode: "compact", maxTokens: 8192 })
        - Has currentSpecJson (refinement):
            refineUI({ currentSpec, instruction: prompt, adapter, contextMode: "compact", maxTokens: 8192 })
     -> Save user generation row (role="user", prompt)
     -> Save assistant generation row (role="assistant", specJson, usage)
     -> Update project.currentSpecJson
     <- Return { spec, validation, usage }
```

### Adapter

`lib/ai.ts` creates an Anthropic adapter via `createAnthropicAdapter()` from
`@entropix/ai/generate`, configured with `process.env.ANTHROPIC_API_KEY`. This
adapter is instantiated per-request (stateless).

### Client-side rendering

The returned spec is a `UISpec` JSON object. The `PreviewPanel` component passes
it to `EntropixRenderer` from `@entropix/ai` along with a `COMPONENT_MAP` that
maps spec node types to actual React components.

The component map (`lib/components-map.ts`) is built in two layers:
1. **Entropix components**: `createWebComponentMap()` merges `@entropix/react`
   and `@entropix/data` exports into a lookup table.
2. **HTML fallbacks**: native HTML elements (`h1`-`h6`, `p`, `div`, `section`,
   `ul`, `li`, `a`, `img`, etc.) are registered so the renderer gracefully
   handles raw HTML nodes the LLM may emit.

Entropix components take priority over HTML fallbacks.


## 6. Multi-Turn Refinement -- Spec-in-Context

Studio uses a **spec-in-context** approach rather than appending full chat history
to each LLM call.

On refinement turns, the API sends only two things:
1. The current `UISpec` JSON (the full state of the UI)
2. The user's new instruction

This means:
- **Constant token cost**: every refinement call costs roughly 4-7K tokens
  regardless of how many turns preceded it.
- **No context drift**: the LLM always sees the exact current state, not a
  compressed or truncated chat history.
- **Spec IS the state**: the UISpec JSON is the single source of truth. There is
  no divergence between what the LLM "remembers" and what the user sees.

The append-only `generations` table preserves full history for the UI chat panel
and version revert, but that history is never sent back to the LLM.


## 7. Share Feature

### Creating a share

```
POST /api/projects/{projectId}/share
  -> auth check + project ownership
  -> Snapshot project.currentSpecJson into shares table
  -> Return { id, url }
```

The share URL is `https://designtodeployment.com/s/{shareId}`.

### Viewing a share

`app/s/[shareId]/page.tsx` is a server component that:
1. Fetches the share record from the database.
2. Parses the `specJson` into a `UISpec`.
3. Renders via `ShareRenderer` (a client component wrapping `EntropixRenderer`).
4. Shows a header bar with the share title and a **Fork** button.
5. Shows a footer: "Built with Entropix Studio".

No authentication is required to view a share.

### Forking a share

The Fork button triggers `POST /api/shares/{shareId}/fork`, which:
1. Requires auth (must be signed in).
2. Creates a new project named `"Fork: {title}"` under the current user.
3. Sets the new project's `currentSpecJson` to the shared spec.
4. Creates an initial assistant generation record with the spec.
5. Redirects the user to the new project workspace.


## 8. Deploy Feature

### Creating a deployment

```
POST /api/projects/{projectId}/deploy
  -> auth check + project ownership
  -> Auto-generate slug from project name if not provided
     (lowercase, alphanumeric + hyphens, random 4-char suffix)
  -> Validate slug: [a-z0-9-], 3-50 chars, no leading/trailing hyphens
  -> Insert into deployments table (unique slug index)
  -> Return { id, slug, url }
```

The deployment URL is `https://{slug}.designtodeployment.com`.

If the slug is already taken, the API returns a `409 Conflict`.

### Subdomain routing

The middleware in `middleware.ts` handles subdomain detection _before_ Clerk auth:

1. Extract `host` header.
2. Skip localhost and `*.vercel.app` domains.
3. If hostname matches `{slug}.designtodeployment.com` (and slug is not `www`):
   rewrite the request to `/deployed/{slug}`.

The `/deployed/[slug]/page.tsx` server component:
1. Fetches the deployment by slug.
2. Renders the frozen spec via `ShareRenderer`.
3. Shows no Studio chrome -- just the raw UI, full viewport.

### DNS setup

Wildcard `*.designtodeployment.com` is configured in Vercel's domain settings
with a wildcard CNAME record. Vercel handles TLS for all subdomains automatically.


## 9. Code Export

```
POST /api/export
  Body: { spec, format?, componentName? }
  -> specToCode({ spec, format, componentName }) from @entropix/ai/generate
  <- { code: string }
```

The `specToCode` function converts a UISpec JSON tree into copy-pasteable React
JSX with `import` statements from `@entropix/react`. Two formats:
- `"component"` -- a JSX fragment suitable for embedding
- `"page"` (default) -- a full page component with wrapping layout

This endpoint is public (no auth) since it operates on the spec JSON passed in
the request body and does not access any user data.

In the workspace UI, the "Export Code" button in the toolbar triggers this call.
The result appears in the Code tab of the PreviewPanel with a copy-to-clipboard
button.


## 10. Version History and Revert

### How history works

Every generation turn creates two rows in the `generations` table: a user message
and an assistant response. The assistant row contains the full `specJson` produced
at that point. This creates an append-only, complete version history.

The chat panel (`ChatPanel`) renders all generation records chronologically. Each
assistant message bubble includes a "Restore" button.

### Revert flow

```
POST /api/projects/{projectId}/revert
  Body: { generationId }
  -> auth check + project ownership
  -> Fetch the generation row, verify it belongs to the project and has specJson
  -> Update project.currentSpecJson to the generation's specJson
  <- { spec }
```

On the client, reverting updates the preview immediately. The revert does not
delete any generation records -- subsequent prompts will generate from the
reverted spec state, and the full history remains intact.


## 11. Brand/Theme Switching

The toolbar exposes two visual controls:

**Brand selector**: Default, Ocean, Sunset
**Theme toggle**: Light, Dark

These are purely client-side. The preview container wraps the `EntropixRenderer`
output with `data-brand` and `data-theme` attributes:

```tsx
<div
  className={`preview-container preview-container--${viewport}`}
  data-brand={brand !== "default" ? brand : undefined}
  data-theme={theme || "light"}
>
  <EntropixRenderer spec={spec} components={COMPONENT_MAP} />
</div>
```

All brand and theme CSS is loaded in `app/globals.css`. The Entropix design token
system uses CSS custom properties scoped to `[data-brand]` and `[data-theme]`
attribute selectors. Switching brand or theme is an instant attribute change with
no re-render of the spec tree.


## 12. Template Library

Six starter templates are defined in `lib/templates.ts`:

| ID          | Name              | Description                          |
|-------------|-------------------|--------------------------------------|
| dashboard   | Analytics Dashboard | Stats cards, charts, data overview |
| landing     | Landing Page      | Hero section, features, pricing, CTA |
| settings    | Settings Page     | Tabs with profile, notifications, security |
| contact     | Contact Form      | Name, email, message with validation |
| ecommerce   | Product Listing   | Product grid with filters and cart   |
| faq         | FAQ Page          | Accordion-style FAQ                  |

### Template flow

1. User clicks a template on the projects page.
2. Client creates a new project via `POST /api/projects`.
3. Navigates to `/projects/{projectId}?template={templateId}`.
4. The workspace page detects the `?template=` query param on mount.
5. If the project has no existing spec and no messages, it auto-sends the
   template's pre-written prompt via `handleSend()`.
6. The query param is stripped from the URL via `history.replaceState()`.
7. The generation pipeline runs as normal, producing the initial UI.


## 13. UI Architecture

### Overall layout

The app shell uses a CSS Grid layout managed by `LayoutContext`:

```
+---------------------------------------------------+
| Sidebar (250px | 48px collapsed)  | Main content  |
|                                   |               |
| - Logo / collapse toggle         | (children)    |
| - Project list                   |               |
| - User button (Clerk)            |               |
+---------------------------------------------------+
```

CSS classes: `.studio-layout`, `.studio-layout--sidebar-collapsed`,
`.studio-layout--fullscreen`.

### Workspace layout

The project workspace (`app/(app)/projects/[projectId]/page.tsx`) is a
client component that renders:

```
+---------------------------------------------------+
| Toolbar (full width)                              |
| Project name | Viewport | Brand | Theme | Actions|
+---------------------------------------------------+
| ChatPanel (280-350px)   | PreviewPanel (flex: 1)  |
|                         |                         |
| Message history         | Tabs: Preview|JSON|Code |
| Prompt input            | EntropixRenderer output |
+---------------------------------------------------+
```

### Fullscreen mode

Toggled via the toolbar button. When active:
- Sidebar collapses completely (CSS class `.studio-layout--fullscreen`)
- Chat panel is hidden (conditional render in workspace)
- Preview panel takes the full viewport width
- Toolbar remains visible with an "Exit Fullscreen" button

### Mobile responsiveness

CSS `@media` queries handle smaller screens:
- Sidebar collapses to an overlay drawer
- Chat and preview panels stack vertically instead of side-by-side
- Toolbar actions wrap to multiple rows

### Component tree

```
RootLayout (app/layout.tsx)
  ClerkProvider
    AppLayout (app/(app)/layout.tsx)
      LayoutContext.Provider
        Sidebar
        main
          ProjectsPage | WorkspacePage
            Toolbar
              ShareDialog
            ChatPanel
              MessageBubble (per message)
            PreviewPanel
              EntropixRenderer
```


## 14. Middleware

`middleware.ts` runs on every request (except static assets). It performs two
operations in order:

1. **Subdomain routing**: checks if the `Host` header matches
   `{slug}.designtodeployment.com`. If so, rewrites to `/deployed/{slug}`.
   Skips this check for `localhost` and `*.vercel.app` hosts.

2. **Clerk auth**: for any route not in the public matcher, calls
   `auth.protect()` to enforce authentication.

The matcher pattern excludes `_next/static`, `_next/image`, and `favicon.ico`
from middleware processing.


## 15. Environment Variables

| Variable                             | Scope        | Purpose                                    |
|--------------------------------------|--------------|--------------------------------------------|
| `ANTHROPIC_API_KEY`                  | Server-only  | Claude API key for generation/refinement   |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`  | Public       | Clerk frontend auth                        |
| `CLERK_SECRET_KEY`                   | Server-only  | Clerk backend auth                         |
| `POSTGRES_URL`                       | Server-only  | Neon Postgres connection string            |
| `NEXT_PUBLIC_BASE_DOMAIN`            | Public       | Base domain for share/deploy URL construction (default: `designtodeployment.com`) |

The `.env.example` file documents all required variables. The Neon database
connection variables are auto-provisioned by the Vercel/Neon integration.


## 16. Deployment

Hosted on Vercel with the following configuration:

| Setting                              | Value                                          |
|--------------------------------------|-------------------------------------------------|
| Root Directory                       | `apps/studio`                                   |
| Build Command                        | `cd ../.. && pnpm turbo run build --filter=studio` |
| Install Command                      | `cd ../.. && pnpm install`                       |
| Framework Preset                     | Next.js                                          |
| Include files outside root directory | Enabled (required for monorepo workspace deps)   |
| Node.js Version                      | 20.x                                             |

### Monorepo considerations

Studio depends on four workspace packages (`@entropix/ai`, `@entropix/core`,
`@entropix/react`, `@entropix/data`, `@entropix/tokens`). The `next.config.js`
`transpilePackages` array ensures these are compiled by Next.js rather than
treated as pre-built externals.

### Deploy pipeline

1. Push to `main` branch on GitHub.
2. Vercel detects the push, runs the install and build commands.
3. Turbo builds workspace dependencies before building Studio.
4. Vercel deploys the output and assigns it to `designtodeployment.com`.
5. Wildcard DNS ensures all `*.designtodeployment.com` subdomains route to the
   same Vercel deployment.


## 17. File Structure

```
apps/studio/
|-- .env.example                         # Required environment variables template
|-- .env.local                           # Local environment variables (gitignored)
|-- .gitignore
|-- drizzle.config.ts                    # Drizzle Kit config (schema path, Postgres dialect)
|-- middleware.ts                         # Clerk auth + subdomain routing
|-- next.config.js                       # transpilePackages for monorepo deps
|-- package.json                         # Dependencies and scripts
|-- tsconfig.json                        # TypeScript configuration
|
|-- app/
|   |-- layout.tsx                       # Root layout: ClerkProvider, global CSS, fonts
|   |-- globals.css                      # All Studio styles, brand themes, responsive queries
|   |
|   |-- (app)/                           # Route group: authenticated Studio pages
|   |   |-- layout.tsx                   # App shell: sidebar + main content grid
|   |   |-- page.tsx                     # Root redirect (to /projects)
|   |   |-- projects/
|   |       |-- page.tsx                 # Project list (server component)
|   |       |-- projects-page-client.tsx # Client-side project list with create/template UI
|   |       |-- [projectId]/
|   |           |-- page.tsx             # Workspace: chat + preview + toolbar
|   |           |-- loading.tsx          # Suspense loading state
|   |
|   |-- sign-in/
|   |   |-- [[...sign-in]]/
|   |       |-- page.tsx                 # Clerk SignIn component
|   |
|   |-- sign-up/
|   |   |-- [[...sign-up]]/
|   |       |-- page.tsx                 # Clerk SignUp component
|   |
|   |-- s/
|   |   |-- [shareId]/
|   |       |-- page.tsx                 # Public share viewer (server component)
|   |       |-- share-renderer.tsx       # Client component: EntropixRenderer wrapper
|   |       |-- fork-button.tsx          # Fork-to-own-project button
|   |       |-- layout.tsx              # Minimal layout for share pages
|   |
|   |-- deployed/
|   |   |-- [slug]/
|   |       |-- page.tsx                 # Deployed site renderer (server component)
|   |       |-- layout.tsx              # Bare layout (no Studio chrome)
|   |
|   |-- api/
|       |-- projects/
|       |   |-- route.ts                 # GET (list) + POST (create) projects
|       |   |-- [projectId]/
|       |       |-- route.ts             # GET (project + generations) + DELETE
|       |       |-- generations/
|       |       |   |-- route.ts         # POST: generate/refine UI from prompt
|       |       |-- share/
|       |       |   |-- route.ts         # POST: create shareable snapshot
|       |       |-- deploy/
|       |       |   |-- route.ts         # POST: deploy to subdomain
|       |       |-- revert/
|       |           |-- route.ts         # POST: revert to earlier generation
|       |-- export/
|       |   |-- route.ts                 # POST: convert UISpec to React code
|       |-- shares/
|           |-- [shareId]/
|               |-- fork/
|                   |-- route.ts         # POST: fork shared spec into new project
|
|-- components/
|   |-- layout/
|   |   |-- sidebar.tsx                  # Collapsible sidebar: logo, project nav, user
|   |-- projects/
|   |   |-- create-project-dialog.tsx    # New project dialog
|   |   |-- project-card.tsx            # Project card for list view
|   |-- workspace/
|       |-- chat-panel.tsx               # Chat interface: message list + prompt input
|       |-- message-bubble.tsx           # Individual chat message with restore button
|       |-- preview-panel.tsx            # Tabbed preview: Preview | JSON | Code
|       |-- toolbar.tsx                  # Workspace toolbar: viewport, brand, theme, actions
|       |-- share-dialog.tsx             # Share/deploy dialog with URL copy
|
|-- lib/
    |-- ai.ts                            # Anthropic adapter factory
    |-- components-map.ts               # Component map for EntropixRenderer
    |-- layout-context.tsx              # React context: sidebar + fullscreen state
    |-- nanoid.ts                       # ID generation helper (12-char nanoid)
    |-- templates.ts                    # 6 starter template definitions
    |-- db/
        |-- index.ts                    # Drizzle client + initDb() bootstrap
        |-- schema.ts                   # Drizzle table definitions (4 tables)
        |-- queries.ts                  # All database query functions
```


## 18. API Routes Summary

| Method | Route                                         | Auth     | Purpose                        |
|--------|-----------------------------------------------|----------|--------------------------------|
| GET    | `/api/projects`                               | Required | List user's projects           |
| POST   | `/api/projects`                               | Required | Create new project             |
| GET    | `/api/projects/{id}`                          | Required | Get project + generations      |
| DELETE | `/api/projects/{id}`                          | Required | Delete project                 |
| POST   | `/api/projects/{id}/generations`              | Required | Generate or refine UI          |
| POST   | `/api/projects/{id}/share`                    | Required | Create share snapshot          |
| POST   | `/api/projects/{id}/deploy`                   | Required | Deploy to subdomain            |
| POST   | `/api/projects/{id}/revert`                   | Required | Revert to earlier generation   |
| POST   | `/api/export`                                 | Public   | Convert spec to React code     |
| POST   | `/api/shares/{shareId}/fork`                  | Required | Fork shared spec into project  |
