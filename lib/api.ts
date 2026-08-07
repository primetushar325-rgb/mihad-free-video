// ============================================================
// Small Next.js API helpers: typed JSON responses + error handling.
// ============================================================

import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { UnauthorizedError } from "@/lib/auth";

export function ok<T>(data: T, message?: string, status = 200) {
  const body: ApiResponse<T> = { success: true, message, data };
  return NextResponse.json(body, { status });
}

export function created<T>(data: T, message = "Created") {
  return ok(data, message, 201);
}

export function badRequest(
  message = "Invalid request",
  errors?: Record<string, string>
) {
  const body: ApiResponse<never> = { success: false, message, errors };
  return NextResponse.json(body, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json(
    { success: false, message } satisfies ApiResponse,
    { status: 404 }
  );
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json(
    { success: false, message } satisfies ApiResponse,
    { status: 401 }
  );
}

/**
 * Wrap an API handler so thrown errors become proper JSON responses.
 * UnauthorizedError -> 401, anything else -> 500.
 */
export function withErrorHandler<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<Response>
): (...args: TArgs) => Promise<Response> {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return unauthorized(err.message);
      }
      console.error("[API ERROR]", err);
      const message =
        err instanceof Error ? err.message : "Internal server error";
      return NextResponse.json(
        { success: false, message } satisfies ApiResponse,
        { status: 500 }
      );
    }
  };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
