// ============================================================
// Authentication: password hashing + JWT sessions in cookies.
// ============================================================
// Uses:
//   - bcryptjs (pure JS, runs on Node/Termux/Vercel)
//   - jose (edge-compatible JWT) signed with AUTH_SECRET
//
// Sessions are stateless JWTs stored in an HttpOnly cookie.
// ============================================================

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getAdminById } from "@/lib/repository";
import type { Admin } from "@/types";

const SALT_ROUNDS = 10;
const ALG = "HS256";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    throw new Error(
      "AUTH_SECRET is not set. Generate one with `openssl rand -base64 48` and add it to .env"
    );
  }
  return new TextEncoder().encode(s);
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function signSession(admin: Admin): Promise<string> {
  const maxAge = maxSessionAge();
  return new SignJWT({
    sub: String(admin.id),
    username: admin.username,
  })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secret());
}

export async function verifySession(token: string): Promise<
  | { ok: true; payload: { sub: string; username: string } }
  | { ok: false }
> {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: [ALG],
    });
    const sub = payload.sub as string | undefined;
    const username = payload.username as string | undefined;
    if (!sub || !username) return { ok: false };
    return { ok: true, payload: { sub, username } };
  } catch {
    return { ok: false };
  }
}

export function sessionCookieName(): string {
  return process.env.SESSION_COOKIE_NAME || "mihad_admin_session";
}

export function maxSessionAge(): number {
  const v = Number(process.env.SESSION_MAX_AGE);
  return Number.isFinite(v) && v > 0 ? v : 60 * 60 * 24 * 7; // 7 days
}

/** Read & validate the current session from the cookie store. */
export async function getCurrentAdmin(): Promise<Admin | null> {
  const store = await cookies();
  const token = store.get(sessionCookieName())?.value;
  if (!token) return null;
  const result = await verifySession(token);
  if (!result.ok) return null;
  const admin = await getAdminById(Number(result.payload.sub));
  return admin;
}

export async function setSessionCookie(admin: Admin): Promise<void> {
  const token = await signSession(admin);
  const store = await cookies();
  store.set(sessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxSessionAge(),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(sessionCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Guard for API routes. Returns the admin or a NextResponse (401) you
 * should return to the client. Usage:
 *
 *   const guard = await requireAdmin();
 *   if (guard.response) return guard.response;
 *   // guard.admin is defined here
 */
export async function requireAdmin(): Promise<{
  admin: Admin;
  response: null;
}> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new UnauthorizedError();
  }
  return { admin, response: null };
}

export class UnauthorizedError extends Error {
  status = 401 as const;
  constructor() {
    super("Unauthorized");
  }
}
