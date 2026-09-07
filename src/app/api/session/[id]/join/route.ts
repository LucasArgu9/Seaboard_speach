import { z } from "zod";
import { joinSession, GameError } from "@/lib/game/engine";
import { parseBody } from "@/lib/http/validate";
import { created, badRequest, conflict, notFound, serverError } from "@/lib/http/respond";
import {
  UNIVERSITIES,
  UNIVERSITY_OTHER,
  CAREERS_BY_UNIVERSITY,
  CAREER_OTHER,
  STUDY_YEARS,
} from "@/lib/careers";

export const dynamic = "force-dynamic";

const schema = z
  .object({
    firstName: z.string().trim().min(1, "Ingresá tu nombre").max(40),
    lastName: z.string().trim().min(1, "Ingresá tu apellido").max(40),
    university: z.enum(UNIVERSITIES as unknown as [string, ...string[]], {
      message: "Elegí tu universidad",
    }),
    universityOther: z.string().trim().max(60).optional().default(""),
    career: z.string().trim().min(1, "Elegí una carrera").max(80),
    careerOther: z.string().trim().max(60).optional().default(""),
    year: z.enum(STUDY_YEARS as unknown as [string, ...string[]], { message: "Elegí el año" }),
    contact: z.string().trim().min(5, "Dejá un correo o teléfono de contacto").max(80),
  })
  .refine((d) => d.university !== UNIVERSITY_OTHER || d.universityOther.length > 0, {
    message: "Escribí tu universidad",
    path: ["universityOther"],
  })
  .refine((d) => d.career !== CAREER_OTHER || d.careerOther.length > 0, {
    message: "Escribí tu carrera",
    path: ["careerOther"],
  })
  .refine(
    (d) => {
      // Con universidad conocida, la carrera debe salir de su lista (o "Otra").
      const list = CAREERS_BY_UNIVERSITY[d.university];
      if (!list) return true; // universidad "Otra": carrera libre
      return d.career === CAREER_OTHER || list.includes(d.career);
    },
    { message: "Elegí una carrera de la lista", path: ["career"] },
  );

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
