// ============================================================
// scripts/create-admin.ts
// Creates (or updates) the initial admin account.
// Passwords are hashed with bcrypt before being stored.
//
// Usage:  npm run setup:admin
//
// Reads ADMIN_USERNAME / ADMIN_PASSWORD from .env (see .env.example).
// ============================================================

import bcrypt from "bcryptjs";

function env(key: string): string {
  const v = (process.env[key] ?? "").trim();
  if (!v) {
    console.error(`\n✖ Missing env var: ${key}\n`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const username = env("ADMIN_USERNAME");
  const password = env("ADMIN_PASSWORD");

  if (password.length < 8) {
    console.error("✖ ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 10);

  const accountId = env("CLOUDFLARE_ACCOUNT_ID");
  const dbId = env("CLOUDFLARE_D1_DATABASE_ID");
  const token = env("CLOUDFLARE_D1_API_TOKEN");
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;

  // Upsert: if the username exists, replace its password hash.
  const sql = `
    INSERT INTO admins (username, password_hash) VALUES (?, ?)
    ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash;
  `;

  console.log(`→ Creating/updating admin "${username}" …`);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params: [username, hash] }),
  });

  const json: any = await res.json();
  if (!res.ok || !json.success) {
    console.error("\n✖ Failed:", JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log(`\n✔ Admin "${username}" is ready.`);
  console.log("  Log in at /admin/login");
}

main().catch((err) => {
  console.error("\n✖ Unexpected error:", err);
  process.exit(1);
});
