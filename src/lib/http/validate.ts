import { z } from "zod";

type ParseResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** Parsea el body JSON contra un schema zod. */
export async function parseBody<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
): Promise<ParseResult<z.infer<S>>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, error: "El cuerpo debe ser JSON válido." };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Datos inválidos.",
    };
  }
  return { ok: true, data: parsed.data };
}
