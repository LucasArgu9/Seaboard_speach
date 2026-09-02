import { forceFinish, GameError } from "@/lib/game/engine";
import { ok, unauthorized, notFound, serverError } from "@/lib/http/respond";
import { isAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

/** POST /api/session/[id]/finish — fin forzado (solo /admin). */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  try {
    const state = await forceFinish(id);
    return ok(state);
  } catch (e) {
    if (e instanceof GameError && e.code === "not_found") return notFound("Sesión no encontrada");
    return serverError(e instanceof Error ? e.message : "No se pudo finalizar");
  }
}
