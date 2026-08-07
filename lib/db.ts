// ============================================================
// Cloudflare D1 database client (REST API).
// ============================================================
// Works everywhere (local dev, Termux, Vercel) because it talks
// to D1 over plain HTTPS — no native modules, no edge bindings.
//
// Required env vars (see .env.example):
//   CLOUDFLARE_ACCOUNT_ID
//   CLOUDFLARE_D1_DATABASE_ID
//   CLOUDFLARE_D1_API_TOKEN
// ============================================================

import type { QueryResult, QueryResultMeta } from "@/lib/db-types";

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

function env(key: string, fallback = ""): string {
  // Works for both server (process.env) and Vercel runtime.
  return (process.env[key] ?? fallback).trim();
}

export function isDbConfigured(): boolean {
  return Boolean(
    env("CLOUDFLARE_ACCOUNT_ID") &&
      env("CLOUDFLARE_D1_DATABASE_ID") &&
      env("CLOUDFLARE_D1_API_TOKEN")
  );
}

function assertConfigured() {
  if (!isDbConfigured()) {
    throw new Error(
      "Database is not configured. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID and CLOUDFLARE_D1_API_TOKEN (see .env.example)."
    );
  }
}

function queryUrl(): string {
  return `${CF_API_BASE}/accounts/${env(
    "CLOUDFLARE_ACCOUNT_ID"
  )}/d1/database/${env("CLOUDFLARE_D1_DATABASE_ID")}/query`;
}

/**
 * Run one or more SQL statements with bound parameters.
 * Returns the raw D1 REST result rows for the FIRST statement.
 *
 * D1 REST body supports either a single string `sql` + `params`,
 * or an array `{sql, params}[]`. We always send the array form so
 * multiple statements can be batched in one HTTP round-trip.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: ReadonlyArray<unknown> = []
): Promise<T[]> {
  assertConfigured();

  const res = await fetch(queryUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("CLOUDFLARE_D1_API_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params: [...params] }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `D1 HTTP ${res.status}: ${text || res.statusText}`
    );
  }

  const json: QueryResult = await res.json();

  if (!json.success) {
    const firstErr = json.errors?.[0];
    throw new Error(
      `D1 query error: ${firstErr?.message ?? "unknown error"} (${
        firstErr?.code ?? "?"
      })`
    );
  }

  const firstResult = json.result?.[0];
  if (!firstResult) return [];

  // SQLite booleans/integers come back as-is; D1 returns rows in `results`.
  return (firstResult.results ?? []) as unknown as T[];
}

/**
 * Run a statement that does not need returned rows (INSERT/UPDATE/DELETE).
 * Returns D1 write metadata (changes, last_row_id).
 */
export async function execute(
  sql: string,
  params: ReadonlyArray<unknown> = []
): Promise<QueryResultMeta> {
  assertConfigured();

  const res = await fetch(queryUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("CLOUDFLARE_D1_API_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params: [...params] }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`D1 HTTP ${res.status}: ${text || res.statusText}`);
  }

  const json: QueryResult = await res.json();

  if (!json.success) {
    const firstErr = json.errors?.[0];
    throw new Error(
      `D1 execute error: ${firstErr?.message ?? "unknown error"} (${
        firstErr?.code ?? "?"
      })`
    );
  }

  const first = json.result?.[0]?.meta ?? {};
  return first;
}

/** Convenience: run a statement and return the inserted row id. */
export async function insertAndReturnId(
  sql: string,
  params: ReadonlyArray<unknown>
): Promise<number> {
  const meta = await execute(sql, params);
  // D1 returns last_row_id_string on large ids; fall back to last_row_id.
  const id =
    meta.last_row_id_string != null
      ? Number(meta.last_row_id_string)
      : (meta.last_row_id ?? meta.changes ?? 0);
  return id;
}
