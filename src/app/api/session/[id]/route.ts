import { buildPublicState, GameError } from "@/lib/game/engine";
import { ok, notFound, serverError } from "@/lib/http/respond";

export const dynamic = "force-dynamic";

/** GET /api/session/[id] — estado público (sin respuestas correctas durante QUESTION). */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const playerId = new URL(req.url).searchParams.get("playerId") ?? undefined;
  try {
    const state = await buildPublicState(id, playerId);
    return ok(state);
  } catch (e) {
    if (e instanceof GameError && e.code === "not_found") return notFound("Sesión no encontrada");
    return serverError(e instanceof Error ? e.message : "Error al leer la sesión");
  }
}
