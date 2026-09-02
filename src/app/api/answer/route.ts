import { z } from "zod";
import { submitAnswer, GameError } from "@/lib/game/engine";
import { parseBody } from "@/lib/http/validate";
import { ok, badRequest, conflict, notFound, serverError } from "@/lib/http/respond";

export const dynamic = "force-dynamic";

const schema = z.object({
  sessionId: z.string().uuid(),
  playerId: z.string().uuid(),
  questionId: z.string().min(1),
  optionId: z.string().min(1),
});

/**
 * POST /api/answer — el teléfono manda su respuesta.
 * El servidor calcula el tiempo (nunca el cliente). La corrección se revela
 * recién en ANSWER_REVEAL, así que la respuesta solo confirma el registro.
 */
export async function POST(req: Request) {
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return badRequest(parsed.error);
  try {
    await submitAnswer(parsed.data);
    return ok({ registered: true });
  } catch (e) {
    if (e instanceof GameError) {
      if (e.code === "not_found") return notFound("Sesión no encontrada");
      return conflict(e.message, e.code);
    }
    return serverError(e instanceof Error ? e.message : "No se pudo registrar la respuesta");
  }
}
