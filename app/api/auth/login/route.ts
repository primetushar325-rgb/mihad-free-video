// POST /api/auth/login
import { withErrorHandler, readJson, ok, badRequest, unauthorized } from "@/lib/api";
import { validateLogin } from "@/lib/validation";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { getAdminByUsername } from "@/lib/repository";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await readJson(req);
  const { errors, value } = validateLogin(body);
  if (Object.keys(errors).length) return badRequest("Invalid login.", errors);

  const admin = await getAdminByUsername(value.username);
  if (!admin) return unauthorized("Invalid username or password.");

  const valid = await verifyPassword(value.password, admin.passwordHash);
  if (!valid) return unauthorized("Invalid username or password.");

  await setSessionCookie({
    id: admin.id,
    username: admin.username,
    createdAt: admin.createdAt,
  });

  return ok(
    { id: admin.id, username: admin.username },
    "Logged in successfully"
  );
});
