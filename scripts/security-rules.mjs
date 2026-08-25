#!/usr/bin/env node
/**
 * Project-specific security rules for CI.
 *
 * These catch the mistakes that generic scanners (CodeQL, gitleaks, bun audit)
 * miss in a TanStack Start + Supabase app:
 *  - service-role / admin clients reachable from browser code
 *  - secrets read via import.meta.env instead of server-side process.env
 *  - new public tables created without RLS or GRANT statements
 *  - hardcoded credentials committed to source
 *
 * Exit code 1 fails the pipeline.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const findings = [];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (["node_modules", ".git", "dist", "build", ".tanstack", ".output"].includes(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(ROOT);
const rel = (f) => relative(ROOT, f);

const isServerOnly = (f) =>
  /\.server\.(ts|tsx|js|mjs)$/.test(f) ||
  rel(f).startsWith("supabase/") ||
  rel(f).startsWith("scripts/");

const report = (level, file, line, message) =>
  findings.push({ level, file: rel(file), line, message });

// ---------------------------------------------------------------- source rules
const sourceFiles = files.filter(
  (f) => [".ts", ".tsx", ".js", ".jsx", ".mjs"].includes(extname(f)) && rel(f).startsWith("src/"),
);

for (const file of sourceFiles) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  const serverOnly = isServerOnly(file);
  const hasStaticAdminImport = /^\s*import[^\n]*client\.server/m.test(text);

  lines.forEach((line, i) => {
    const n = i + 1;
    const code = line.replace(/\/\/.*$/, "");

    // 1. Admin (service-role) client must never be statically imported into a
    //    module that can enter the client bundle.
    if (
      hasStaticAdminImport &&
      !serverOnly &&
      /client\.server/.test(code) &&
      /^\s*import/.test(line)
    ) {
      report(
        "error",
        file,
        n,
        "Static import of the service-role client outside a *.server file. Use `await import('@/integrations/supabase/client.server')` inside a handler.",
      );
    }

    // 2. Service role key must never appear in app source.
    if (/SUPABASE_SERVICE_ROLE_KEY|service_role/i.test(code) && !serverOnly) {
      report("error", file, n, "Reference to the service-role key outside server-only code.");
    }

    // 3. Secrets must not be exposed through the client-visible env.
    if (/import\.meta\.env\.[A-Za-z_]*(SECRET|SERVICE_ROLE|PRIVATE|_KEY\b)/.test(code)) {
      const isPublishable = /PUBLISHABLE|VITE_SUPABASE_PUBLISHABLE_KEY|ANON/.test(code);
      if (!isPublishable) {
        report(
          "error",
          file,
          n,
          "Secret read from import.meta.env (shipped to the browser). Read it from process.env inside a server handler.",
        );
      }
    }

    // 4. process.env at module scope in a client-reachable file.
    if (!serverOnly && /process\.env\./.test(code) && !/\.functions\.(ts|tsx)$/.test(file)) {
      report(
        "warn",
        file,
        n,
        "process.env used in client-reachable code; it is undefined in the browser.",
      );
    }

    // 5. Hardcoded credentials.
    if (
      /(eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})|sb_secret_[A-Za-z0-9_-]{10,}|sk_live_[A-Za-z0-9]{10,}/.test(
        code,
      )
    ) {
      report("error", file, n, "Hardcoded credential/token literal found in source.");
    }

    // 6. Dangerous sinks.
    if (/dangerouslySetInnerHTML/.test(code)) {
      report(
        "warn",
        file,
        n,
        "dangerouslySetInnerHTML — confirm the value is sanitized or trusted CMS content.",
      );
    }
    if (/\beval\(|new Function\(/.test(code)) {
      report("error", file, n, "eval()/new Function() is not allowed.");
    }
  });

  // 7. Authenticated server functions must validate their input.
  if (/\.functions\.tsx?$/.test(file)) {
    const fnCount = (text.match(/createServerFn\(/g) ?? []).length;
    const validatorCount = (text.match(/inputValidator\(/g) ?? []).length;
    const postCount = (text.match(/method:\s*["']POST["']/g) ?? []).length;
    if (postCount > validatorCount) {
      report(
        "warn",
        file,
        1,
        `${postCount} POST server function(s) but only ${validatorCount} inputValidator(s) in ${fnCount} function(s) — verify every mutation validates its payload.`,
      );
    }
  }
}

// ------------------------------------------------------------ migration rules
const migrations = files.filter(
  (f) => rel(f).startsWith("supabase/migrations") && f.endsWith(".sql"),
);

for (const file of migrations) {
  const sql = readFileSync(file, "utf8");
  const created = [
    ...sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?public\.("?[\w]+"?)/gi),
  ].map((m) => m[1].replace(/"/g, ""));
  for (const table of created) {
    const t = table.toLowerCase();
    const lower = sql.toLowerCase();
    if (
      !new RegExp(
        `alter\\s+table\\s+(?:public\\.)?"?${t}"?[\\s\\S]{0,80}enable\\s+row\\s+level\\s+security`,
      ).test(lower)
    ) {
      report("error", file, 1, `Table public.${table} created without ENABLE ROW LEVEL SECURITY.`);
    }
    if (!new RegExp(`grant[\\s\\S]{0,120}on[\\s\\S]{0,40}"?${t}"?`).test(lower)) {
      report(
        "error",
        file,
        1,
        `Table public.${table} created without GRANT statements (PostgREST cannot reach it).`,
      );
    }
    if (!new RegExp(`create\\s+policy[\\s\\S]{0,200}on\\s+(?:public\\.)?"?${t}"?`).test(lower)) {
      report(
        "error",
        file,
        1,
        `Table public.${table} has RLS but no policies — every request will be denied.`,
      );
    }
  }
  if (/security\s+definer/i.test(sql) && !/set\s+search_path/i.test(sql)) {
    report(
      "error",
      file,
      1,
      "SECURITY DEFINER function without `SET search_path` (search_path hijacking risk).",
    );
  }
  if (/using\s*\(\s*true\s*\)/i.test(sql) && /to\s+(anon|public)/i.test(sql)) {
    report(
      "warn",
      file,
      1,
      "Policy grants unrestricted access to anon/public — confirm the data is meant to be public.",
    );
  }
}

// ----------------------------------------------------------------- env hygiene
// The platform-managed .env holds only publishable client config; fail if a
// non-public value ever lands in it.
const envFile = files.find((f) => rel(f) === ".env");
if (envFile) {
  readFileSync(envFile, "utf8")
    .split("\n")
    .forEach((line, i) => {
      const name = line.split("=")[0]?.trim();
      if (!name || name.startsWith("#")) return;
      const isPublic = name.startsWith("VITE_") || /PROJECT_ID|PUBLISHABLE|ANON|_URL$/.test(name);
      if (!isPublic || /SECRET|SERVICE_ROLE|PRIVATE/i.test(name)) {
        report(
          "error",
          envFile,
          i + 1,
          `Non-public value "${name}" committed in .env — store it with the secrets manager instead.`,
        );
      }
    });
}

// ---------------------------------------------------------------------- output
const errors = findings.filter((f) => f.level === "error");
const warnings = findings.filter((f) => f.level === "warn");

for (const f of [...errors, ...warnings]) {
  const icon = f.level === "error" ? "✖" : "⚠";
  console.log(`${icon} ${f.file}:${f.line}  ${f.message}`);
  if (process.env["GITHUB_ACTIONS"]) {
    console.log(
      `::${f.level === "error" ? "error" : "warning"} file=${f.file},line=${f.line}::${f.message}`,
    );
  }
}

console.log(
  `\nScanned ${sourceFiles.length} source files and ${migrations.length} migrations — ${errors.length} error(s), ${warnings.length} warning(s).`,
);

if (errors.length > 0) {
  console.error("\nSecurity rules failed. Fix the errors above before deploying.");
  process.exit(1);
}
