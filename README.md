# 🎬 Mihad Free Video

A premium, mobile-first **video library** web app built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Cloudflare D1**.

Visitors browse a beautiful golden + black video library. Every video card stores a **Google Drive download link** — clicking *Download* opens it in a new tab. **No video files are hosted.** It includes a complete, secure **admin panel** to manage videos, categories, the hero slider, AdSense, and site settings.

> Built to be pushed straight to **GitHub** and deployed on **Vercel**, and fully developable from **Android + Termux**.

---

## ✨ Features

| Area | What you get |
| --- | --- |
| **Home** | Sticky glass header, live search, horizontal category nav, hero slider (auto-rotate, swipe, fade), instant-filtering video grid |
| **Video cards** | 1:1 thumbnail, category badge, featured badge (golden glow + wider card), upload time, golden hover |
| **Video page** | Large thumbnail, full info, tags, share button, **Download** (Google Drive), 8+ related videos, SEO structured data |
| **Categories** | Unlimited, friendly slugs (`/category/anime`), hide/show, reorder, instant filtering |
| **Search** | Instant live results (title, description, tags, category) + full `/search` page |
| **Slider** | Unlimited slides, image/title/subtitle/optional button, enable/disable, reorder |
| **Admin panel** | Secure login (hashed passwords + JWT cookie session), dashboard, full CRUD for videos/categories/slides/settings/ads, bulk delete, live preview — **phone friendly** |
| **PWA** | `manifest.webmanifest`, service worker, offline page, install prompt, home-screen support |
| **SEO** | Dynamic metadata, Open Graph, Twitter cards, `sitemap.xml`, `robots.txt`, JSON-LD structured data, canonical URLs, friendly slugs |
| **AdSense ready** | Master toggle + 4 editable slots (header, between cards, details, footer) + publisher ID |
| **Security** | Protected routes, JWT sessions, bcrypt hashing, input validation/sanitization, parameterised SQL |
| **Performance** | ISR caching, lazy images, code-splitting, optimized fonts — Lighthouse-friendly |

---

## 🧱 Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + Framer Motion
- **Database:** Cloudflare D1 (accessed via REST API — works on Vercel & locally, no native modules)
- **Auth:** `jose` (JWT) + `bcryptjs`
- **Icons:** lucide-react
- **Deployment:** Vercel (GitHub)

---

## 📁 Project Structure

```
mihad-free-video/
├── app/
│   ├── (site)/                 # Public site (shared header/footer)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Home
│   │   ├── video/[id]/page.tsx # Video details
│   │   ├── category/[slug]/page.tsx
│   │   └── search/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   └── (protected)/        # Auth-guarded admin
│   │       ├── layout.tsx
│   │       ├── page.tsx        # Dashboard
│   │       ├── videos/page.tsx
│   │       ├── categories/page.tsx
│   │       ├── slides/page.tsx
│   │       ├── ads/page.tsx
│   │       └── settings/page.tsx
│   ├── api/                    # REST API routes
│   │   ├── auth/{login,logout,me}
│   │   ├── videos/[route + [id]]
│   │   ├── categories/[route + [id]]
│   │   ├── slides/[route + [id]]
│   │   ├── settings/route.ts
│   │   └── dashboard/route.ts
│   ├── layout.tsx              # Root layout (fonts, SEO, providers)
│   ├── loading.tsx  error.tsx  not-found.tsx
│   ├── sitemap.ts  robots.ts  manifest.ts
├── components/
│   ├── site/                   # Header, HeroSlider, VideoCard, VideoGrid, Footer, SearchBar, AdSlot…
│   ├── admin/                  # AdminShell, managers, Modal, ConfirmDialog…
│   ├── ui/Toast.tsx
│   └── pwa/                    # ServiceWorkerRegister, InstallPrompt
├── lib/                        # db.ts, repository.ts, auth.ts, validation.ts, api.ts, safe.ts, utils.ts
├── database/                   # schema.sql + migrations
├── scripts/                    # migrate.ts, seed.ts, create-admin.ts
├── public/                     # sw.js, offline.html, icons/
├── types/index.ts
└── styles/globals.css
```

---

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone https://github.com/<you>/mihad-free-video.git
cd mihad-free-video
npm install
```

### 2. Environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `CLOUDFLARE_D1_DATABASE_ID` | The D1 database ID |
| `CLOUDFLARE_D1_API_TOKEN` | A D1 read/write API token |
| `AUTH_SECRET` | A long random string (`openssl rand -base64 48`) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Initial admin credentials (min 8 chars) |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (used for SEO) |
| `NEXT_PUBLIC_SITE_NAME` | Public site name |

### 3. Create the database & seed (see [Database Setup](#-database-setup-cloudflare-d1))

```bash
npm run migrate      # creates all tables
npm run setup:admin  # creates your admin login (hashes the password)
npm run seed         # optional: adds starter categories + a welcome slide
```

### 4. Run

```bash
npm run dev          # http://localhost:3000
```

Log in to the admin panel at **`/admin/login`** with your `ADMIN_USERNAME` / `ADMIN_PASSWORD`, then add your first videos.

---

## 🗄️ Database Setup (Cloudflare D1)

D1 is a free SQLite database. Create one in ~2 minutes:

**Option A — Dashboard**

1. Go to <https://dash.cloudflare.com> → **Workers & Pages → D1**.
2. **Create database** → name it `mihad-free-video`.
3. Copy the **Database ID** → `CLOUDFLARE_D1_DATABASE_ID`.
4. Find your **Account ID** (right sidebar) → `CLOUDFLARE_ACCOUNT_ID`.
5. **My Profile → API Tokens → Create Token → Custom token** with:
   - Permission: `Account → D1 → Edit`
6. Copy the token → `CLOUDFLARE_D1_API_TOKEN`.

**Option B — Wrangler CLI**

```bash
npm i -g wrangler
wrangler login
wrangler d1 create mihad-free-video   # prints account id + database id
```

Then create a D1 API token in the dashboard (Step 5 above).

Now run the migrations:

```bash
npm run migrate
npm run setup:admin
```

> The app talks to D1 over HTTPS from anywhere (local, Termux, Vercel) — no edge bindings, no native modules.

---

## 🌐 REST API

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/videos` | – | List/search (`?q=`, `?categoryId=`, `?featured=`, `?limit=`) |
| `GET` | `/api/videos/:id` | – | Single video |
| `POST` | `/api/videos` | ✅ | Create |
| `PUT` | `/api/videos/:id` | ✅ | Update |
| `DELETE` | `/api/videos/:id` | ✅ | Delete |
| `DELETE` | `/api/videos` | ✅ | Bulk delete (`{ ids: [] }`) |
| `GET` | `/api/categories` | – | List visible (`?all=1` for admin) |
| `POST`/`PUT`/`DELETE` | `/api/categories[/:id]` | ✅ | CRUD |
| `GET` | `/api/slides` | – | List active (`?all=1` for admin) |
| `POST`/`PUT`/`DELETE` | `/api/slides[/:id]` | ✅ | CRUD |
| `GET` | `/api/settings` | – | Public settings |
| `PUT` | `/api/settings` | ✅ | Update |
| `GET` | `/api/dashboard` | ✅ | Stats |
| `POST` | `/api/auth/login` · `logout` · `GET /me` | – / ✅ | Auth |

All write endpoints validate & sanitize input and return a typed `{ success, message, data, errors }` envelope.

---

## 🔐 Security

- Admin routes are guarded (client redirect) **and** every mutating API checks a JWT session server-side.
- Passwords are stored only as **bcrypt hashes**.
- JWTs live in an **HttpOnly, SameSite=Lax** cookie.
- All SQL uses **parameterised queries** (no string interpolation → no SQL injection).
- User input is **sanitized & length-limited** before storage.

---

## 📱 PWA

The app is installable and works offline once visited:

- `app/manifest.ts` → `/manifest.webmanifest`
- `public/sw.js` → service worker (app-shell + stale-while-revalidate caching)
- `public/offline.html` → shown when the network fails
- Install prompt banner appears on supported browsers; dismiss is remembered.

Toggle PWA globally from **Admin → Settings → Enable PWA**.

---

## 📣 Google AdSense

1. Get approved by AdSense and copy your **Publisher ID** (`ca-pub-…`).
2. **Admin → Ads** → paste the Publisher ID + the ad-unit code for each slot.
3. Toggle **Enable Ads** on/off at any time.

Slots never shift layout when empty.

---

## ☁️ Deployment (Vercel)

1. Push to GitHub.
2. <https://vercel.com> → **New Project** → import the repo.
3. **Settings → Environment Variables** — add every variable from `.env`:
   - `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_D1_API_TOKEN`
   - `AUTH_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SITE_URL` (your `https://<project>.vercel.app`), `NEXT_PUBLIC_SITE_NAME`
4. **Deploy.**
5. (Once) run migrations against D1 from your machine: `npm run migrate && npm run setup:admin`.
6. Set `NEXT_PUBLIC_SITE_URL` to your custom domain and redeploy.

> The service worker only registers in production, so dev previews behave normally.

---

## 🤖 Development from Android (Termux)

```bash
# 1. Install prerequisites in Termux
pkg update && pkg install git nodejs nano
# (optional) termux-setup-storage  # access shared storage

# 2. Clone & work
git clone https://github.com/<you>/mihad-free-video.git
cd mihad-free-video
npm install
cp .env.example .env
nano .env                       # fill in values

# 3. Migrate + create admin
npm run migrate
npm run setup:admin

# 4. Run the dev server
npm run dev
```

No native compilation required — all deps are pure JS, so Termux builds them cleanly. Commit & push back to GitHub from Termux, then deploy on Vercel.

---

## 📜 NPM Scripts

| Script | Action |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run migrate` | Apply `database/schema.sql` to D1 |
| `npm run setup:admin` | Create/update the admin account |
| `npm run seed` | Add starter categories + a welcome slide |
| `npm run db:setup` | `migrate` + `seed` |

---

## 🗂️ Database Schema

See [`database/schema.sql`](./database/schema.sql). Tables: `admins`, `categories`, `videos`, `slides`, `settings` (single row).

---

## 📄 License

MIT — free to use, modify and distribute.

Built with ❤️ as a polished, production-ready starter. Replace the default brand, add your real videos via the admin panel, and you're live.
