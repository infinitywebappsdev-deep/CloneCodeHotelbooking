# Security

## Automated scanning in CI

Every push and pull request runs `.github/workflows/security.yml`, which must pass before deployment:

| Job                            | What it checks                                  | Fails on                              |
| ------------------------------ | ----------------------------------------------- | ------------------------------------- |
| **Lint, typecheck & build**    | ESLint, TypeScript, production build            | Any error                             |
| **Dependency vulnerabilities** | `bun audit --audit-level=high`                  | High/critical CVEs in dependencies    |
| **Secret scanning**            | Gitleaks across full git history                | Any committed credential              |
| **CodeQL**                     | GitHub static analysis (`security-and-quality`) | Findings reported to the Security tab |
| **App-specific rules**         | `scripts/security-rules.mjs`                    | Errors listed below                   |

A weekly scheduled run re-scans `main` so newly disclosed CVEs surface without a commit.
Dependabot (`.github/dependabot.yml`) opens weekly dependency PRs and monthly action-version PRs.

## Project rules (`bun run security`)

Errors (block the pipeline):

- Service-role/admin Supabase client statically imported into client-reachable code
- Any reference to the service-role key outside `*.server.ts` / `supabase/` / `scripts/`
- Secrets read via `import.meta.env` (those ship to the browser)
- Hardcoded JWTs, `sb_secret_*`, or `sk_live_*` literals
- `eval()` / `new Function()`
- A new `public` table created without `ENABLE ROW LEVEL SECURITY`, without `GRANT`s, or without policies
- `SECURITY DEFINER` functions missing `SET search_path`
- Non-public values committed to `.env`

Warnings (visible, non-blocking): `dangerouslySetInnerHTML` usage, `process.env` in client-reachable code, POST server functions without an `inputValidator`, and `USING (true)` policies granted to `anon`/`public`.

## Running locally

```bash
bun run security        # project rules
bun run security:deps   # dependency audit
bun run lint && bun run typecheck
```

## Reporting a vulnerability

Email the hotel's technical contact rather than opening a public issue.
