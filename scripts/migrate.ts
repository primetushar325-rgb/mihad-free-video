// ============================================================
// scripts/migrate.ts
// Runs database/schema.sql against Cloudflare D1 via REST API.
// Usage:  npm run migrate
// ============================================================

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, "../database/schema.sql");

function env(key: string): string {
  const v = (process.env[key] ?? "").trim();
  if (!v) {
    console.error(
      `\n✖ Missing env var: ${key}\n` +
        `  Create a free D1 database (see README) and copy .env.example -> .env.\n`
    );
    process.exit(1);
  }
  return v;
}

async function main() {
  console.log("→ Loading schema from database/schema.sql …");
  if (!existsSync(SCHEMA_PATH)) {
    console.error("✖ database/schema.sql not found.");
    process.exit(1);
  }
  const sql = readFileSync(SCHEMA_PATH, "utf8");

  const accountId = env("CLOUDFLARE_ACCOUNT_ID");
  const dbId = env("CLOUDFLARE_D1_DATABASE_ID");
  const token = env("CLOUDFLARE_D1_API_TOKEN");

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;
  console.log("→ Applying migration to Cloudflare D1 …");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql }),
  });

  const json: any = await res.json();
  if (!res.ok || !json.success) {
    console.error("\n✖ Migration failed:");
    console.error(JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log("\n✔ Migration applied successfully.");
  const tables = Array.isArray(json.result)
    ? json.result.map((r: any) => r.results?.length ?? 0)
    : [];
  console.log(`  Statements executed: ${tables.length}`);
}

main().catch((err) => {
  console.error("\n✖ Unexpected error:", err);
  process.exit(1);
});
