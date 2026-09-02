import { z } from "zod";
import { parseBody } from "@/lib/http/validate";
import { ok, badRequest, unauthorized } from "@/lib/http/respond";
import { passwordMatches, setAdminCookie, clearAdminCookie } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const schema = z.object({ password: z.string().min(1) });

export async function POST(req: Request) {
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return badRequest(parsed.error);
  if (!passwordMatches(parsed.data.password)) return unauthorized("Contraseña incorrecta");
  await setAdminCookie();
  return ok({ ok: true });
}

export async function DELETE() {
  await clearAdminCookie();
  return ok({ ok: true });
}
