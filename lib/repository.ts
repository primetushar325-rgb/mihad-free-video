// ============================================================
// Repository layer — all SQL lives here.
// Maps raw D1 rows -> typed domain objects (camelCase) and back.
// ============================================================

import { query, execute, insertAndReturnId } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type {
  Category,
  Video,
  VideoWithCategory,
  Slide,
  Settings,
  DashboardStats,
  VideoInput,
  CategoryInput,
  SlideInput,
  SettingsInput,
  Admin,
} from "@/types";

// ------------------------------------------------------------
// Row shapes (snake_case from SQLite)
// ------------------------------------------------------------
interface AdminRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}
interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  icon: string;
  order_number: number;
  is_visible: number;
  created_at: string;
}
interface VideoRow {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  google_drive_url: string;
  tags: string;
  upload_time: string;
  category_id: number | null;
  featured: number;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
  category_slug?: string | null;
}
interface SlideRow {
  id: number;
  image_url: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  order_number: number;
  active: number;
  created_at: string;
}
interface SettingsRow {
  id: number;
  website_name: string;
  logo_url: string;
  favicon_url: string;
  footer_text: string;
  primary_color: string;
  secondary_color: string;
  enable_pwa: number;
  enable_ads: number;
  adsense_header: string;
  adsense_between_cards: string;
  adsense_details: string;
  adsense_footer: string;
  adsense_client: string;
}

// ------------------------------------------------------------
// Mappers
// ------------------------------------------------------------
const toBool = (v: number | unknown): boolean => Number(v) === 1;

export function mapAdmin(r: AdminRow): Admin {
  return { id: r.id, username: r.username, createdAt: r.created_at };
}
export function mapCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    icon: r.icon ?? "",
    orderNumber: r.order_number,
    isVisible: toBool(r.is_visible),
    createdAt: r.created_at,
  };
}
export function mapVideo(r: VideoRow): Video {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    thumbnailUrl: r.thumbnail_url,
    googleDriveUrl: r.google_drive_url,
    tags: r.tags
      ? r.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    uploadTime: r.upload_time,
    categoryId: r.category_id,
    featured: toBool(r.featured),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
export function mapVideoWithCategory(r: VideoRow): VideoWithCategory {
  return {
    ...mapVideo(r),
    categoryName: r.category_name ?? null,
    categorySlug: r.category_slug ?? null,
  };
}
export function mapSlide(r: SlideRow): Slide {
  return {
    id: r.id,
    imageUrl: r.image_url,
    title: r.title ?? "",
    subtitle: r.subtitle ?? "",
    buttonText: r.button_text ?? "",
    buttonLink: r.button_link ?? "",
    orderNumber: r.order_number,
    active: toBool(r.active),
    createdAt: r.created_at,
  };
}
export function mapSettings(r: SettingsRow): Settings {
  return {
    id: r.id,
    websiteName: r.website_name,
    logoUrl: r.logo_url ?? "",
    faviconUrl: r.favicon_url ?? "",
    footerText: r.footer_text ?? "",
    primaryColor: r.primary_color,
    secondaryColor: r.secondary_color,
    enablePwa: toBool(r.enable_pwa),
    enableAds: toBool(r.enable_ads),
    adsenseHeader: r.adsense_header ?? "",
    adsenseBetweenCards: r.adsense_between_cards ?? "",
    adsenseDetails: r.adsense_details ?? "",
    adsenseFooter: r.adsense_footer ?? "",
    adsenseClient: r.adsense_client ?? "",
  };
}

// ============================================================
// ADMINS
// ============================================================
export async function getAdminByUsername(
  username: string
): Promise<(Admin & { passwordHash: string }) | null> {
  const rows = await query<AdminRow>(
    "SELECT * FROM admins WHERE username = ? LIMIT 1",
    [username]
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return { ...mapAdmin(r), passwordHash: r.password_hash };
}

export async function getAdminById(id: number): Promise<Admin | null> {
  const rows = await query<AdminRow>(
    "SELECT * FROM admins WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ? mapAdmin(rows[0]) : null;
}

export async function createAdmin(
  username: string,
  passwordHash: string
): Promise<number> {
  return insertAndReturnId(
    "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
    [username, passwordHash]
  );
}

export async function countAdmins(): Promise<number> {
  const rows = await query<{ c: number }>(
    "SELECT COUNT(*) AS c FROM admins"
  );
  return rows[0]?.c ?? 0;
}

// ============================================================
// CATEGORIES
// ============================================================
export async function listCategories(opts?: {
  includeHidden?: boolean;
}): Promise<Category[]> {
  const sql = opts?.includeHidden
    ? "SELECT * FROM categories ORDER BY order_number ASC, id ASC"
    : "SELECT * FROM categories WHERE is_visible = 1 ORDER BY order_number ASC, id ASC";
  const rows = await query<CategoryRow>(sql);
  return rows.map(mapCategory);
}

export async function getAllCategories(): Promise<Category[]> {
  return listCategories({ includeHidden: true });
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const rows = await query<CategoryRow>(
    "SELECT * FROM categories WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ? mapCategory(rows[0]) : null;
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const rows = await query<CategoryRow>(
    "SELECT * FROM categories WHERE slug = ? LIMIT 1",
    [slug]
  );
  return rows[0] ? mapCategory(rows[0]) : null;
}

export async function createCategory(input: CategoryInput): Promise<number> {
  const slug =
    (input.slug?.trim() || slugify(input.name)) + ""; // ensure string
  const finalSlug = await uniqueCategorySlug(slug);
  return insertAndReturnId(
    `INSERT INTO categories (name, slug, icon, order_number, is_visible)
     VALUES (?, ?, ?, ?, ?)`,
    [
      input.name.trim(),
      finalSlug,
      input.icon?.trim() ?? "",
      input.orderNumber ?? 0,
      input.isVisible === false ? 0 : 1,
    ]
  );
}

export async function updateCategory(
  id: number,
  input: Partial<CategoryInput>
): Promise<number> {
  const fields: string[] = [];
  const params: unknown[] = [];
  if (input.name !== undefined) {
    fields.push("name = ?");
    params.push(input.name.trim());
  }
  if (input.slug !== undefined && input.slug.trim() !== "") {
    fields.push("slug = ?");
    params.push(input.slug.trim());
  }
  if (input.icon !== undefined) {
    fields.push("icon = ?");
    params.push(input.icon.trim());
  }
  if (input.orderNumber !== undefined) {
    fields.push("order_number = ?");
    params.push(input.orderNumber);
  }
  if (input.isVisible !== undefined) {
    fields.push("is_visible = ?");
    params.push(input.isVisible ? 1 : 0);
  }
  if (fields.length === 0) return 0;
  params.push(id);
  const meta = await execute(
    `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
  return meta.changes ?? 0;
}

export async function deleteCategory(id: number): Promise<number> {
  const meta = await execute("DELETE FROM categories WHERE id = ?", [id]);
  return meta.changes ?? 0;
}

export async function uniqueCategorySlug(base: string): Promise<string> {
  const slug = base;
  const existing = await query<{ id: number }>(
    "SELECT id FROM categories WHERE slug = ? LIMIT 1",
    [slug]
  );
  if (!existing[0]) return slug;
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = `${slug}-${i}`;
    const clash = await query<{ id: number }>(
      "SELECT id FROM categories WHERE slug = ? LIMIT 1",
      [candidate]
    );
    if (!clash[0]) return candidate;
    i++;
  }
}

// ============================================================
// VIDEOS
// ============================================================
export async function listVideos(opts?: {
  categoryId?: number;
  featured?: boolean;
  limit?: number;
  offset?: number;
}): Promise<VideoWithCategory[]> {
  const { categoryId, featured, limit, offset } = opts ?? {};
  const where: string[] = [];
  const params: unknown[] = [];
  if (categoryId !== undefined) {
    where.push("v.category_id = ?");
    params.push(categoryId);
  }
  if (featured !== undefined) {
    where.push("v.featured = ?");
    params.push(featured ? 1 : 0);
  }
  const whereSql =
    where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const limitSql =
    limit !== undefined ? `LIMIT ? OFFSET ?` : "";
  if (limit !== undefined) {
    params.push(limit, offset ?? 0);
  }

  const sql = `
    SELECT v.*, c.name AS category_name, c.slug AS category_slug
    FROM videos v
    LEFT JOIN categories c ON c.id = v.category_id
    ${whereSql}
    ORDER BY v.featured DESC, v.created_at DESC, v.id DESC
    ${limitSql}
  `;
  const rows = await query<VideoRow>(sql, params);
  return rows.map(mapVideoWithCategory);
}

export async function searchVideos(
  term: string,
  opts?: { categoryId?: number; featured?: boolean; limit?: number }
): Promise<VideoWithCategory[]> {
  const t = `%${term.toLowerCase()}%`;
  const where = [
    "(LOWER(v.title) LIKE ? OR LOWER(v.description) LIKE ? OR LOWER(v.tags) LIKE ? OR LOWER(c.name) LIKE ?)",
  ];
  const params: unknown[] = [t, t, t, t];
  if (opts?.categoryId !== undefined) {
    where.push("v.category_id = ?");
    params.push(opts.categoryId);
  }
  if (opts?.featured !== undefined) {
    where.push("v.featured = ?");
    params.push(opts.featured ? 1 : 0);
  }
  const limitSql = opts?.limit !== undefined ? `LIMIT ?` : "";
  if (opts?.limit !== undefined) params.push(opts.limit);

  const sql = `
    SELECT v.*, c.name AS category_name, c.slug AS category_slug
    FROM videos v
    LEFT JOIN categories c ON c.id = v.category_id
    WHERE ${where.join(" AND ")}
    ORDER BY v.featured DESC, v.created_at DESC
    ${limitSql}
  `;
  const rows = await query<VideoRow>(sql, params);
  return rows.map(mapVideoWithCategory);
}

export async function getVideoById(
  id: number
): Promise<VideoWithCategory | null> {
  const rows = await query<VideoRow>(
    `SELECT v.*, c.name AS category_name, c.slug AS category_slug
     FROM videos v
     LEFT JOIN categories c ON c.id = v.category_id
     WHERE v.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ? mapVideoWithCategory(rows[0]) : null;
}

export async function getRelatedVideos(
  video: Video,
  limit = 8
): Promise<VideoWithCategory[]> {
  if (video.categoryId) {
    const rows = await query<VideoRow>(
      `SELECT v.*, c.name AS category_name, c.slug AS category_slug
       FROM videos v
       LEFT JOIN categories c ON c.id = v.category_id
       WHERE v.category_id = ? AND v.id != ?
       ORDER BY v.featured DESC, v.created_at DESC LIMIT ?`,
      [video.categoryId, video.id, limit]
    );
    const fromCategory = rows.map(mapVideoWithCategory);
    if (fromCategory.length >= limit) return fromCategory;
    // Backfill with latest videos if the category is thin.
    const need = limit - fromCategory.length;
    const excludeIds = [video.id, ...fromCategory.map((v) => v.id)];
    const placeholders = excludeIds.map(() => "?").join(",");
    const extra = await query<VideoRow>(
      `SELECT v.*, c.name AS category_name, c.slug AS category_slug
       FROM videos v
       LEFT JOIN categories c ON c.id = v.category_id
       WHERE v.id NOT IN (${placeholders})
       ORDER BY v.created_at DESC LIMIT ?`,
      [...excludeIds, need]
    );
    return [...fromCategory, ...extra.map(mapVideoWithCategory)];
  }
  // No category — return latest videos.
  const rows = await query<VideoRow>(
    `SELECT v.*, c.name AS category_name, c.slug AS category_slug
     FROM videos v
     LEFT JOIN categories c ON c.id = v.category_id
     WHERE v.id != ?
     ORDER BY v.created_at DESC LIMIT ?`,
    [video.id, limit]
  );
  return rows.map(mapVideoWithCategory);
}

export async function createVideo(input: VideoInput): Promise<number> {
  return insertAndReturnId(
    `INSERT INTO videos
      (title, description, thumbnail_url, google_drive_url, tags, upload_time, category_id, featured, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [
      input.title.trim(),
      input.description.trim(),
      input.thumbnailUrl.trim(),
      input.googleDriveUrl.trim(),
      input.tags.trim(),
      input.uploadTime || new Date().toISOString(),
      input.categoryId,
      input.featured ? 1 : 0,
    ]
  );
}

export async function updateVideo(
  id: number,
  input: Partial<VideoInput>
): Promise<number> {
  const fields: string[] = [];
  const params: unknown[] = [];
  if (input.title !== undefined) {
    fields.push("title = ?");
    params.push(input.title.trim());
  }
  if (input.description !== undefined) {
    fields.push("description = ?");
    params.push(input.description.trim());
  }
  if (input.thumbnailUrl !== undefined) {
    fields.push("thumbnail_url = ?");
    params.push(input.thumbnailUrl.trim());
  }
  if (input.googleDriveUrl !== undefined) {
    fields.push("google_drive_url = ?");
    params.push(input.googleDriveUrl.trim());
  }
  if (input.tags !== undefined) {
    fields.push("tags = ?");
    params.push(input.tags.trim());
  }
  if (input.uploadTime !== undefined) {
    fields.push("upload_time = ?");
    params.push(input.uploadTime);
  }
  if (input.categoryId !== undefined) {
    fields.push("category_id = ?");
    params.push(input.categoryId);
  }
  if (input.featured !== undefined) {
    fields.push("featured = ?");
    params.push(input.featured ? 1 : 0);
  }
  if (fields.length === 0) return 0;
  fields.push("updated_at = datetime('now')");
  params.push(id);
  const meta = await execute(
    `UPDATE videos SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
  return meta.changes ?? 0;
}

export async function deleteVideo(id: number): Promise<number> {
  const meta = await execute("DELETE FROM videos WHERE id = ?", [id]);
  return meta.changes ?? 0;
}

export async function deleteVideos(ids: number[]): Promise<number> {
  if (ids.length === 0) return 0;
  const placeholders = ids.map(() => "?").join(",");
  const meta = await execute(
    `DELETE FROM videos WHERE id IN (${placeholders})`,
    ids
  );
  return meta.changes ?? 0;
}

// ============================================================
// SLIDES
// ============================================================
export async function listSlides(opts?: { onlyActive?: boolean }): Promise<Slide[]> {
  const sql = opts?.onlyActive
    ? "SELECT * FROM slides WHERE active = 1 ORDER BY order_number ASC, id ASC"
    : "SELECT * FROM slides ORDER BY order_number ASC, id ASC";
  const rows = await query<SlideRow>(sql);
  return rows.map(mapSlide);
}

export async function getSlideById(id: number): Promise<Slide | null> {
  const rows = await query<SlideRow>(
    "SELECT * FROM slides WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ? mapSlide(rows[0]) : null;
}

export async function createSlide(input: SlideInput): Promise<number> {
  return insertAndReturnId(
    `INSERT INTO slides (image_url, title, subtitle, button_text, button_link, order_number, active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.imageUrl.trim(),
      input.title?.trim() ?? "",
      input.subtitle?.trim() ?? "",
      input.buttonText?.trim() ?? "",
      input.buttonLink?.trim() ?? "",
      input.orderNumber ?? 0,
      input.active === false ? 0 : 1,
    ]
  );
}

export async function updateSlide(
  id: number,
  input: Partial<SlideInput>
): Promise<number> {
  const fields: string[] = [];
  const params: unknown[] = [];
  if (input.imageUrl !== undefined) {
    fields.push("image_url = ?");
    params.push(input.imageUrl.trim());
  }
  if (input.title !== undefined) {
    fields.push("title = ?");
    params.push(input.title.trim());
  }
  if (input.subtitle !== undefined) {
    fields.push("subtitle = ?");
    params.push(input.subtitle.trim());
  }
  if (input.buttonText !== undefined) {
    fields.push("button_text = ?");
    params.push(input.buttonText.trim());
  }
  if (input.buttonLink !== undefined) {
    fields.push("button_link = ?");
    params.push(input.buttonLink.trim());
  }
  if (input.orderNumber !== undefined) {
    fields.push("order_number = ?");
    params.push(input.orderNumber);
  }
  if (input.active !== undefined) {
    fields.push("active = ?");
    params.push(input.active ? 1 : 0);
  }
  if (fields.length === 0) return 0;
  params.push(id);
  const meta = await execute(
    `UPDATE slides SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
  return meta.changes ?? 0;
}

export async function deleteSlide(id: number): Promise<number> {
  const meta = await execute("DELETE FROM slides WHERE id = ?", [id]);
  return meta.changes ?? 0;
}

// ============================================================
// SETTINGS (single row, id = 1)
// ============================================================
export async function getSettings(): Promise<Settings> {
  const rows = await query<SettingsRow>(
    "SELECT * FROM settings WHERE id = 1 LIMIT 1"
  );
  if (!rows[0]) {
    return {
      id: 1,
      websiteName: "Mihad Free Video",
      logoUrl: "",
      faviconUrl: "",
      footerText: "© Mihad Free Video. All rights reserved.",
      primaryColor: "#f5a623",
      secondaryColor: "#0a0a0a",
      enablePwa: true,
      enableAds: true,
      adsenseHeader: "",
      adsenseBetweenCards: "",
      adsenseDetails: "",
      adsenseFooter: "",
      adsenseClient: "",
    };
  }
  return mapSettings(rows[0]);
}

export async function updateSettings(
  input: Partial<SettingsInput>
): Promise<void> {
  const allowed: Array<keyof SettingsInput> = [
    "websiteName",
    "logoUrl",
    "faviconUrl",
    "footerText",
    "primaryColor",
    "secondaryColor",
    "enablePwa",
    "enableAds",
    "adsenseHeader",
    "adsenseBetweenCards",
    "adsenseDetails",
    "adsenseFooter",
    "adsenseClient",
  ];
  const fields: string[] = [];
  const params: unknown[] = [];
  for (const key of allowed) {
    if (input[key] === undefined) continue;
    const col = settingsKeyToColumn(key);
    fields.push(`${col} = ?`);
    if (key === "enablePwa" || key === "enableAds") {
      params.push(input[key] ? 1 : 0);
    } else {
      params.push(input[key]);
    }
  }
  fields.push("updated_at = datetime('now')");
  await execute(
    `UPDATE settings SET ${fields.join(", ")} WHERE id = 1`,
    params
  );
}

function settingsKeyToColumn(key: keyof SettingsInput): string {
  const map: Record<string, string> = {
    websiteName: "website_name",
    logoUrl: "logo_url",
    faviconUrl: "favicon_url",
    footerText: "footer_text",
    primaryColor: "primary_color",
    secondaryColor: "secondary_color",
    enablePwa: "enable_pwa",
    enableAds: "enable_ads",
    adsenseHeader: "adsense_header",
    adsenseBetweenCards: "adsense_between_cards",
    adsenseDetails: "adsense_details",
    adsenseFooter: "adsense_footer",
    adsenseClient: "adsense_client",
  };
  return map[key] ?? key;
}

// ============================================================
// ANALYTICS (visits + downloads)
// ============================================================
export interface VisitRow {
  id: number;
  visitor_id: string;
  page_path: string;
  referrer: string;
  created_at: string;
}
export interface DownloadRow {
  id: number;
  visitor_id: string;
  video_id: number;
  video_title: string;
  created_at: string;
}

/** Record a page visit. Returns the new row id. */
export async function trackVisit(input: {
  visitorId?: string;
  pagePath?: string;
  referrer?: string;
}): Promise<number> {
  return insertAndReturnId(
    `INSERT INTO visits (visitor_id, page_path, referrer)
     VALUES (?, ?, ?)`,
    [
      input.visitorId?.slice(0, 200) ?? "",
      input.pagePath?.slice(0, 500) ?? "",
      input.referrer?.slice(0, 500) ?? "",
    ]
  );
}

/** Record a video download. */
export async function trackDownload(input: {
  visitorId?: string;
  videoId: number;
  videoTitle?: string;
}): Promise<number> {
  return insertAndReturnId(
    `INSERT INTO downloads (visitor_id, video_id, video_title)
     VALUES (?, ?, ?)`,
    [
      input.visitorId?.slice(0, 200) ?? "",
      input.videoId,
      input.videoTitle?.slice(0, 300) ?? "",
    ]
  );
}

/** Today's date as the local "YYYY-MM-DD" prefix D1 stores (UTC). */
function todayPrefix(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getAnalyticsSummary() {
  const [totalVisits, uniqueVisitors, todayVisits, totalDownloads, topDownloads] =
    await Promise.all([
      query<{ c: number }>("SELECT COUNT(*) AS c FROM visits"),
      query<{ c: number }>(
        "SELECT COUNT(DISTINCT visitor_id) AS c FROM visits WHERE visitor_id != ''"
      ),
      query<{ c: number }>(
        "SELECT COUNT(*) AS c FROM visits WHERE created_at >= ?",
        [`${todayPrefix()} 00:00:00`]
      ),
      query<{ c: number }>("SELECT COUNT(*) AS c FROM downloads"),
      query<DownloadRow>(
        `SELECT video_id, video_title, COUNT(*) AS c
         FROM downloads
         GROUP BY video_id, video_title
         ORDER BY c DESC
         LIMIT 10`
      ),
    ]);

  return {
    totalVisits: totalVisits[0]?.c ?? 0,
    uniqueVisitors: uniqueVisitors[0]?.c ?? 0,
    todayVisits: todayVisits[0]?.c ?? 0,
    totalDownloads: totalDownloads[0]?.c ?? 0,
    topDownloads: (topDownloads as Array<DownloadRow & { c: number }>).map(
      (r) => ({
        videoId: r.video_id,
        videoTitle: r.video_title,
        count: r.c,
      })
    ),
  };
}

// ============================================================
// DASHBOARD
// ============================================================
export async function getDashboardStats(): Promise<DashboardStats> {
  const [videos, cats, featured, slides, admins, recent] = await Promise.all([
    query<{ c: number }>("SELECT COUNT(*) AS c FROM videos"),
    query<{ c: number }>("SELECT COUNT(*) AS c FROM categories"),
    query<{ c: number }>(
      "SELECT COUNT(*) AS c FROM videos WHERE featured = 1"
    ),
    query<{ c: number }>("SELECT COUNT(*) AS c FROM slides"),
    query<{ c: number }>("SELECT COUNT(*) AS c FROM admins"),
    query<VideoRow>(
      `SELECT v.*, c.name AS category_name, c.slug AS category_slug
       FROM videos v
       LEFT JOIN categories c ON c.id = v.category_id
       ORDER BY v.created_at DESC LIMIT 6`
    ),
  ]);

  const analytics = await getAnalyticsSummary();
  return {
    totalVideos: videos[0]?.c ?? 0,
    totalCategories: cats[0]?.c ?? 0,
    totalFeatured: featured[0]?.c ?? 0,
    totalSlides: slides[0]?.c ?? 0,
    totalAdmins: admins[0]?.c ?? 0,
    recentVideos: recent.map(mapVideoWithCategory),
    ...analytics,
  };
}

// ============================================================
// Helpers
// ============================================================
export { slugify };

// ============================================================
// PUSH NOTIFICATIONS
// ============================================================
export interface PushSubRow {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  prefs: string;
  device: string;
  created_at: string;
  last_active: string;
}
export interface NotificationRow {
  id: number;
  title: string;
  message: string;
  icon: string;
  image: string;
  url: string;
  target: string;
  status: string;
  sent_count: number;
  delivered_count: number;
  click_count: number;
  event_id: string | null;
  schedule_at: string | null;
  created_at: string;
  sent_at: string | null;
}
export interface NotifSettingsRow {
  id: number;
  global_enabled: number;
  new_videos: number;
  new_tools: number;
  new_templates: number;
  new_updates: number;
  announcements: number;
  sound: number;
  default_icon: string;
  default_url: string;
}

export async function savePushSub(input: {
  subscription: { endpoint: string; keys?: { p256dh?: string; auth?: string } };
  prefs?: Record<string, unknown>;
  device?: string;
}): Promise<void> {
  const endpoint = input.subscription.endpoint;
  const p256dh = input.subscription.keys?.p256dh ?? "";
  const auth = input.subscription.keys?.auth ?? "";
  if (!endpoint || !p256dh || !auth) throw new Error("Invalid subscription");
  await execute(
    `INSERT INTO push_subs (endpoint, p256dh, auth, prefs, device, last_active)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(endpoint) DO UPDATE SET
       prefs=excluded.prefs, device=excluded.device, last_active=datetime('now')`,
    [endpoint, p256dh, auth, JSON.stringify(input.prefs ?? {}), input.device ?? ""]
  );
}

export async function listPushSubs(): Promise<PushSubRow[]> {
  return query<PushSubRow>("SELECT * FROM push_subs ORDER BY created_at DESC");
}

export async function updatePushPrefs(
  endpoint: string,
  prefs: Record<string, unknown>
): Promise<void> {
  await execute(
    "UPDATE push_subs SET prefs = ?, last_active = datetime('now') WHERE endpoint = ?",
    [JSON.stringify(prefs ?? {}), endpoint]
  );
}

export async function createNotification(input: {
  title: string;
  message: string;
  icon?: string;
  image?: string;
  url?: string;
  target?: string;
  status?: string;
  eventId?: string;
  scheduleAt?: string;
}): Promise<number> {
  const id = await insertAndReturnId(
    `INSERT INTO notifications
      (title, message, icon, image, url, target, status, event_id, schedule_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title || "Notification",
      input.message || "",
      input.icon || "",
      input.image || "",
      input.url || "/",
      input.target || "all",
      input.status || "sent",
      input.eventId || null,
      input.scheduleAt || null,
    ]
  );
  return id;
}

export async function listNotifications(limit = 100): Promise<NotificationRow[]> {
  return query<NotificationRow>(
    "SELECT * FROM notifications ORDER BY id DESC LIMIT ?",
    [limit]
  );
}

export async function notifExists(eventId?: string): Promise<boolean> {
  if (!eventId) return false;
  const rows = await query<{ id: number }>(
    "SELECT id FROM notifications WHERE event_id = ? LIMIT 1",
    [eventId]
  );
  return rows.length > 0;
}

export async function updateNotificationStatus(
  id: number,
  status: string,
  sentCount?: number
): Promise<void> {
  await execute(
    "UPDATE notifications SET status = ?, sent_count = ?, sent_at = datetime('now') WHERE id = ?",
    [status, sentCount ?? 0, id]
  );
}

export async function getNotifSettings(): Promise<NotifSettingsRow> {
  const rows = await query<NotifSettingsRow>(
    "SELECT * FROM notif_settings WHERE id = 1 LIMIT 1"
  );
  if (!rows[0]) {
    return {
      id: 1, global_enabled: 1, new_videos: 1, new_tools: 1, new_templates: 1,
      new_updates: 1, announcements: 1, sound: 1,
      default_icon: "/icons/icon-192.png", default_url: "/",
    };
  }
  return rows[0];
}

export async function updateNotifSettings(
  input: Record<string, unknown>
): Promise<void> {
  const allowed = [
    "global_enabled", "new_videos", "new_tools", "new_templates",
    "new_updates", "announcements", "sound", "default_icon", "default_url",
  ];
  const fields: string[] = [];
  const params: unknown[] = [];
  for (const k of allowed) {
    if (input[k] !== undefined) {
      fields.push(`${k} = ?`);
      params.push(input[k]);
    }
  }
  if (fields.length === 0) return;
  await execute(`UPDATE notif_settings SET ${fields.join(", ")} WHERE id = 1`, params);
}
