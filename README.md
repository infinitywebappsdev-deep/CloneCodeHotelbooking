# Banky Hotel & Suites — Web App

Marketing site, reservation flow, staff admin dashboard, guest portal, CMS and
notification queue for Banky Hotel & Suites, Ado-Ekiti.

**Stack:** TanStack Start v1 (React 19 + Vite 7) · Tailwind CSS v4 · shadcn/ui ·
Supabase (Postgres + Auth + Storage) via Lovable Cloud · Lovable managed email.

Related docs: [DEPLOYMENT.md](./DEPLOYMENT.md) (staging) ·
[PRODUCTION.md](./PRODUCTION.md) (production, migrations, rollback) ·
[TESTING.md](./TESTING.md) · [SECURITY.md](./SECURITY.md)

---

## 1. Prerequisites

| Tool         | Version    | Notes                                 |
| ------------ | ---------- | ------------------------------------- |
| Bun          | ≥ 1.1      | primary package manager / runner      |
| Node.js      | ≥ 20       | only needed if you prefer npm         |
| Supabase CLI | ≥ 1.200    | applying migrations outside Lovable   |
| Docker       | any recent | only for a fully local Supabase stack |

## 2. Frontend + SSR locally

```sh
git clone <repository-url>
cd <repository-name>
bun install
cp .env.example .env          # fill in your project values
bun run dev                   # http://localhost:8080
```

`bun run dev` runs the whole app: TanStack Start serves the React frontend and
the server functions/API routes in one process. There is no separate backend
server to start.

Useful scripts:

```sh
bun run build         # production build (Cloudflare Worker target)
bun run build:dev     # development-mode build, used to catch SSR/prerender errors
bun run preview       # serve the production build
bun run lint          # ESLint
bun run typecheck     # TypeScript
bun run security      # project security rules (scripts/security-rules.mjs)
bun run security:deps # dependency vulnerability audit
```

## 3. Backend

The backend is Supabase plus server code that ships with the app:

- `src/lib/*.functions.ts` — `createServerFn` RPC used by the UI
  (`site`, `admin`, `guest`, `cms`, `settings`).
- `src/lib/*.server.ts` — server-only helpers (`notify`, `reminder-queue`,
  `supabase-public`). Never imported by client components.
- `src/routes/api/public/reminders.ts` — scheduler endpoint for reminders.

Environment rules: browser code reads `import.meta.env.VITE_*`; server code
reads `process.env.*` **inside handlers**. `SUPABASE_SERVICE_ROLE_KEY` must
never appear in a `VITE_` variable or in client-reachable code.

### Connecting to a hosted Supabase project

Fill `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
and their `VITE_` counterparts in `.env`. On Lovable Cloud these are injected
for you — you only add `EMAIL_SENDER_DOMAIN` and `FRONT_DESK_EMAIL`.

### Fully local Supabase (optional)

```sh
supabase start                        # Postgres, Auth, Storage on localhost
supabase db reset                     # applies every file in supabase/migrations
```

Then point `.env` at the printed local URL and keys.

## 4. Database migrations

Migrations are plain SQL in `supabase/migrations/`, applied in filename order.
They create: `profiles`, `user_roles`, `rooms`, `reservations`, `messages`,
`pages`, `site_settings`, `notification_jobs`; the `has_role`, `is_staff`,
`room_availability`, `handle_new_user`, `touch_updated_at` functions; the
`media` storage bucket; and all RLS policies and grants.

```sh
supabase link --project-ref <your-project-ref>
supabase db push                 # apply pending migrations to the linked project
supabase migration new <name>    # author a new migration
supabase db reset                # rebuild a local database from scratch
```

Every new `public` table must, in the same migration and in this order:
`CREATE TABLE` → `GRANT` → `ENABLE ROW LEVEL SECURITY` → `CREATE POLICY`.
`bun run security` fails the build if this is missing.

Regenerate types after a schema change:

```sh
supabase gen types typescript --project-id <ref> > src/integrations/supabase/types.ts
```

(In Lovable, migrations are applied and types regenerated automatically.)

### Seeding staff access

The first admin must be granted a role directly in SQL:

```sql
insert into public.user_roles (user_id, role)
values ('<auth-user-uuid>', 'admin')
on conflict do nothing;
```

Afterwards, admins add staff from **Admin → Overview → Staff**.

## 5. CI

`.github/workflows/security.yml` runs on every push and pull request:

| Job                     | Command                                              |
| ----------------------- | ---------------------------------------------------- |
| Lint, typecheck & build | `bun run lint`, `bun run typecheck`, `bun run build` |
| Dependency audit        | `bun audit --audit-level=high`                       |
| Secret scanning         | Gitleaks over full history                           |
| Static analysis         | CodeQL (`security-and-quality`)                      |
| App rules               | `bun run scripts/security-rules.mjs`                 |

CI needs no secrets: the build uses `.env.example`-shaped placeholders and
never contacts the database. A weekly cron re-scans `main` for new CVEs.

To validate migrations in CI, add a job that runs `supabase db reset` against a
service-container Postgres — do not point CI at the production project.

## 6. Project layout

```
src/
  routes/                 file-based routes (public pages, /auth, /admin, /my-stay, api/)
  routes/_authenticated/  auth-gated subtree (admin + guest portal)
  components/site/        header, footer, booking bar, settings provider
  lib/                    server functions, server-only helpers, hotel data, branding
  integrations/supabase/  generated clients, auth middleware, types (do not edit)
supabase/migrations/      SQL schema history
scripts/security-rules.mjs
```
