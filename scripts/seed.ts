// ============================================================
// scripts/seed.ts
// Seeds a few demo categories + slides so the site isn't empty
// on a fresh install. Safe to run multiple times (idempotent-ish).
//
// Usage:  npm run seed
//
// NOTE: This does NOT create demo videos (you add real videos with
// real Google Drive links from the admin panel). It only sets up
// categories and one welcome slider slide.
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

const D1 = () => {
  const accountId = env("CLOUDFLARE_ACCOUNT_ID");
  const dbId = env("CLOUDFLARE_D1_DATABASE_ID");
  const token = env("CLOUDFLARE_D1_API_TOKEN");
  return {
    url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
    token,
  };
};

async function run(sql: string, params: unknown[] = []) {
  const { url, token } = D1();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
  });
  const json: any = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(`D1 error: ${JSON.stringify(json)}`);
  }
  return json;
}

function slug(name: string, i: number) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `cat-${i}`;
}

async function main() {
  const categories = [
    { name: "Free Videos", icon: "🎬" },
    { name: "Anime", icon: "🌸" },
    { name: "Gaming", icon: "🎮" },
    { name: "Movies", icon: "🎥" },
    { name: "Funny", icon: "😂" },
    { name: "Education", icon: "📚" },
    { name: "Sports", icon: "⚽" },
    { name: "Technology", icon: "💻" },
    { name: "Music", icon: "🎵" },
  ];

  console.log("→ Seeding categories …");
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    await run(
      `INSERT INTO categories (name, slug, icon, order_number, is_visible)
       VALUES (?, ?, ?, ?, 1)
       ON CONFLICT(slug) DO UPDATE SET name = excluded.name, icon = excluded.icon`,
      [c.name, slug(c.name, i), c.icon, i]
    );
  }

  console.log("→ Seeding welcome slide …");
  await run(
    `INSERT INTO slides (image_url, title, subtitle, button_text, button_link, order_number, active)
     VALUES (?, ?, ?, ?, ?, 0, 1)`,
    [
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80",
      "Welcome to Mihad Free Video",
      "Browse and download premium videos for free.",
      "Explore Now",
      "/",
    ]
  );

  // Make sure an admin exists.
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "";
  if (password) {
    console.log(`→ Ensuring admin "${username}" exists …`);
    const hash = bcrypt.hashSync(password, 10);
    await run(
      `INSERT INTO admins (username, password_hash) VALUES (?, ?)
       ON CONFLICT(username) DO NOTHING`,
      [username, hash]
    );
  }

  console.log("\n✔ Seed complete.");
  console.log("  Add your first video from the admin panel → /admin/login");
}

main().catch((err) => {
  console.error("\n✖ Seed failed:", err.message);
  process.exit(1);
});
