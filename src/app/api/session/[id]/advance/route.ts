import { z } from "zod";
import { advanceRound, GameError } from "@/lib/game/engine";
import { parseBody } from "@/lib/http/validate";
import { ok, badRequest, conflict, notFound, serverError } from "@/lib/http/respond";

export const dynamic = "force-dynamic";

const schema = z.object({ rev: z.number().int().nonnegative().optional() });

/**
 * POST /api/session/[id]/advance — la pantalla grande conduce la ronda.
 * Idempotente por `rev`: si otra pantalla ya avanzó, devuelve el estado actual.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return badRequest(parsed.error);
  try {
    const state = await advanceRound(id, parsed.data.rev);
    return ok(state);
  } catch (e) {
    if (e instanceof GameError) {
      if (e.code === "not_found") return notFound("Sesión no encontrada");
      return conflict(e.message, "invalid_state");
    }
    return serverError(e instanceof Error ? e.message : "No se pudo avanzar");
  }
}
