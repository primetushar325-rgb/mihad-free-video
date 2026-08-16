// ============================================================
// Input validation & sanitization.
// Returns { errors, value } so API routes can return 400 with details.
// ============================================================

import type {
  VideoInput,
  CategoryInput,
  SlideInput,
  SettingsInput,
} from "@/types";

export type Errors = Record<string, string>;

const isStr = (v: unknown): v is string => typeof v === "string";

/** Strip control chars & trim. Removes <script>/on* handlers defensively. */
export function sanitizeText(input: string, maxLen = 5000): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") // control chars
    .trim()
    .slice(0, maxLen);
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateVideo(body: unknown): {
  errors: Errors;
  value: VideoInput;
} {
  const errors: Errors = {};
  const b = (body ?? {}) as Record<string, unknown>;

  const title = isStr(b.title) ? sanitizeText(b.title, 200) : "";
  const description = isStr(b.description)
    ? sanitizeText(b.description, 5000)
    : "";
  const thumbnailUrl = isStr(b.thumbnailUrl) ? b.thumbnailUrl.trim() : "";
  const googleDriveUrl = isStr(b.googleDriveUrl)
    ? b.googleDriveUrl.trim()
    : "";
  const tags = isStr(b.tags) ? sanitizeText(b.tags, 500) : "";
  const uploadTime = isStr(b.uploadTime) ? b.uploadTime.trim() : "";

  const categoryId =
    b.categoryId === null || b.categoryId === undefined || b.categoryId === ""
      ? null
      : Number(b.categoryId);
  const featured = b.featured === true || b.featured === 1 || b.featured === "1";

  if (!title) errors.title = "Title is required.";
  if (!thumbnailUrl) errors.thumbnailUrl = "Thumbnail URL is required.";
  else if (!isValidUrl(thumbnailUrl))
    errors.thumbnailUrl = "Thumbnail must be a valid http(s) URL.";
  if (!googleDriveUrl) errors.googleDriveUrl = "Google Drive link is required.";
  else if (!isValidUrl(googleDriveUrl))
    errors.googleDriveUrl = "Google Drive link must be a valid http(s) URL.";
  if (categoryId !== null && (!Number.isFinite(categoryId) || categoryId <= 0))
    errors.categoryId = "Invalid category.";
  if (uploadTime && isNaN(Date.parse(uploadTime)))
    errors.uploadTime = "Invalid upload time.";

  const value: VideoInput = {
    title,
    description,
    thumbnailUrl,
    googleDriveUrl,
    tags,
    uploadTime: uploadTime || new Date().toISOString(),
    categoryId: categoryId !== null && Number.isFinite(categoryId) ? categoryId : null,
    featured,
  };
  return { errors, value };
}

export function validateCategory(body: unknown): {
  errors: Errors;
  value: CategoryInput;
} {
  const errors: Errors = {};
  const b = (body ?? {}) as Record<string, unknown>;

  const name = isStr(b.name) ? sanitizeText(b.name, 80) : "";
  if (!name) errors.name = "Category name is required.";

  const value: CategoryInput = {
    name,
    slug: isStr(b.slug) ? sanitizeText(b.slug, 80) : undefined,
    icon: isStr(b.icon) ? sanitizeText(b.icon, 50) : undefined,
    orderNumber: b.orderNumber !== undefined ? Number(b.orderNumber) : undefined,
    isVisible: b.isVisible === false || b.isVisible === 0 ? false : true,
  };
  return { errors, value };
}

export function validateSlide(body: unknown): {
  errors: Errors;
  value: SlideInput;
} {
  const errors: Errors = {};
  const b = (body ?? {}) as Record<string, unknown>;

  const imageUrl = isStr(b.imageUrl) ? b.imageUrl.trim() : "";
  if (!imageUrl) errors.imageUrl = "Image URL is required.";
  else if (!isValidUrl(imageUrl))
    errors.imageUrl = "Image URL must be a valid http(s) URL.";

  const value: SlideInput = {
    imageUrl,
    title: isStr(b.title) ? sanitizeText(b.title, 120) : undefined,
    subtitle: isStr(b.subtitle) ? sanitizeText(b.subtitle, 200) : undefined,
    buttonText: isStr(b.buttonText) ? sanitizeText(b.buttonText, 40) : undefined,
    buttonLink: isStr(b.buttonLink) ? b.buttonLink.trim() : undefined,
    orderNumber: b.orderNumber !== undefined ? Number(b.orderNumber) : undefined,
    active: b.active === false || b.active === 0 ? false : true,
  };
  if (
    value.buttonLink !== undefined &&
    value.buttonLink !== "" &&
    !isValidUrl(value.buttonLink)
  ) {
    errors.buttonLink = "Button link must be a valid http(s) URL.";
  }
  return { errors, value };
}

export function validateSettings(body: unknown): {
  errors: Errors;
  value: SettingsInput;
} {
  const errors: Errors = {};
  const b = (body ?? {}) as Record<string, unknown>;
  const value: SettingsInput = {};

  if (b.websiteName !== undefined)
    value.websiteName = sanitizeText(String(b.websiteName), 80);
  if (b.logoUrl !== undefined) {
    value.logoUrl = String(b.logoUrl).trim();
    if (value.logoUrl && !isValidUrl(value.logoUrl))
      errors.logoUrl = "Logo must be a valid URL.";
  }
  if (b.faviconUrl !== undefined) {
    value.faviconUrl = String(b.faviconUrl).trim();
    if (value.faviconUrl && !isValidUrl(value.faviconUrl))
      errors.faviconUrl = "Favicon must be a valid URL.";
  }
  if (b.footerText !== undefined)
    value.footerText = sanitizeText(String(b.footerText), 300);
  if (b.primaryColor !== undefined) {
    value.primaryColor = String(b.primaryColor).trim();
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.primaryColor))
      errors.primaryColor = "Use a hex color like #f5a623.";
  }
  if (b.secondaryColor !== undefined) {
    value.secondaryColor = String(b.secondaryColor).trim();
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.secondaryColor))
      errors.secondaryColor = "Use a hex color like #0a0a0a.";
  }
  if (b.enablePwa !== undefined) value.enablePwa = toBool(b.enablePwa);
  if (b.enableAds !== undefined) value.enableAds = toBool(b.enableAds);
  if (b.adsenseHeader !== undefined)
    value.adsenseHeader = String(b.adsenseHeader).slice(0, 4000);
  if (b.adsenseBetweenCards !== undefined)
    value.adsenseBetweenCards = String(b.adsenseBetweenCards).slice(0, 4000);
  if (b.adsenseDetails !== undefined)
    value.adsenseDetails = String(b.adsenseDetails).slice(0, 4000);
  if (b.adsenseFooter !== undefined)
    value.adsenseFooter = String(b.adsenseFooter).slice(0, 4000);
  if (b.adsenseClient !== undefined)
    value.adsenseClient = sanitizeText(String(b.adsenseClient), 40);

  return { errors, value };
}

export function validateLogin(body: unknown): {
  errors: Errors;
  value: { username: string; password: string };
} {
  const errors: Errors = {};
  const b = (body ?? {}) as Record<string, unknown>;
  const username = isStr(b.username) ? b.username.trim() : "";
  const password = isStr(b.password) ? b.password : "";
  if (!username) errors.username = "Username is required.";
  if (!password) errors.password = "Password is required.";
  return { errors, value: { username, password } };
}

export function toBool(v: unknown): boolean {
  return v === true || v === 1 || v === "1" || v === "true";
}

export function validateGiveaway(body: unknown): {
  errors: Errors;
  value: import("@/types").GiveawayInput;
} {
  const b = (body ?? {}) as Record<string, unknown>;
  const errors: Errors = {};
  const value: import("@/types").GiveawayInput = {};
  if (b.enabled !== undefined) value.enabled = toBool(b.enabled);
  if (b.floatingButtonEnabled !== undefined)
    value.floatingButtonEnabled = toBool(b.floatingButtonEnabled);
  if (b.title !== undefined) value.title = sanitizeText(String(b.title), 120);
  if (b.description !== undefined)
    value.description = sanitizeText(String(b.description), 800);
  if (b.subscriberCount !== undefined) {
    const count = Number(b.subscriberCount);
    if (!Number.isInteger(count) || count < 0 || count > 1000000000)
      errors.subscriberCount = "Subscriber count must be a positive whole number.";
    else value.subscriberCount = count;
  }
  for (const [source, target] of [
    ["youtubeUrl", "youtubeUrl"],
    ["facebookUrl", "facebookUrl"],
    ["telegramUrl", "telegramUrl"],
  ] as const) {
    if (b[source] !== undefined) {
      const url = String(b[source]).trim();
      if (url && !isValidUrl(url)) errors[source] = "Enter a valid http(s) URL.";
      else value[target] = url;
    }
  }
  for (const key of ["startTime", "endTime"] as const) {
    if (b[key] === undefined) continue;
    const raw = b[key] === null || b[key] === "" ? null : String(b[key]);
    if (raw && Number.isNaN(Date.parse(raw))) errors[key] = "Enter a valid date and time.";
    else value[key] = raw ? new Date(raw).toISOString() : null;
  }
  if (value.startTime && value.endTime && Date.parse(value.endTime) <= Date.parse(value.startTime))
    errors.endTime = "End time must be after start time.";
  if (b.buttonPosition !== undefined) {
    if (b.buttonPosition !== "bottom-right" && b.buttonPosition !== "bottom-left")
      errors.buttonPosition = "Invalid button position.";
    else value.buttonPosition = b.buttonPosition;
  }
  if (value.enabled && !value.endTime)
    errors.endTime = "An end time is required when the giveaway is enabled.";
  return { errors, value };
}
