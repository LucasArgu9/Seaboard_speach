import { startRound, GameError } from "@/lib/game/engine";
import { ok, conflict, notFound, serverError } from "@/lib/http/respond";

export const dynamic = "force-dynamic";

/** POST /api/session/[id]/start — LOBBY/WAITING -> COUNTDOWN (2..MAX jugadores). */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const state = await startRound(id);
    return ok(state);
  } catch (e) {
    if (e instanceof GameError) {
      if (e.code === "not_found") return notFound("Sesión no encontrada");
      return conflict(e.message, "invalid_state");
    }
    return serverError(e instanceof Error ? e.message : "No se pudo iniciar");
  }
}
