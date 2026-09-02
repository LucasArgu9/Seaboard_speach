import { computeAdminStats } from "@/lib/admin/stats";
import { isAdmin } from "@/lib/admin/session";
import { ok, unauthorized, serverError } from "@/lib/http/respond";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    return ok(await computeAdminStats());
  } catch (e) {
    return serverError(e instanceof Error ? e.message : "Error al calcular estadísticas");
  }
}
