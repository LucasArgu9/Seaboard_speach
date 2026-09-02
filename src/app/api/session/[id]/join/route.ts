import { z } from "zod";
import { joinSession, GameError } from "@/lib/game/engine";
import { parseBody } from "@/lib/http/validate";
import { created, badRequest, conflict, notFound, serverError } from "@/lib/http/respond";
import { CAREERS, STUDY_YEARS } from "@/lib/careers";

export const dynamic = "force-dynamic";

const schema = z.object({
  firstName: z.string().trim().min(1, "Ingresá tu nombre").max(40),
  lastName: z.string().trim().min(1, "Ingresá tu apellido").max(40),
  career: z.enum(CAREERS as unknown as [string, ...string[]], { message: "Elegí una carrera" }),
  year: z.enum(STUDY_YEARS as unknown as [string, ...string[]], { message: "Elegí el año" }),
});

/** POST /api/session/[id]/join */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return badRequest(parsed.error);
  try {
    const res = await joinSession(id, parsed.data);
    return created(res);
  } catch (e) {
    if (e instanceof GameError) {
      if (e.code === "not_found") return notFound("Sesión no encontrada");
      if (e.code === "full") return conflict("La sala está llena", "full");
      return conflict(e.message, "invalid_state");
    }
    return serverError(e instanceof Error ? e.message : "No se pudo unir");
  }
}
