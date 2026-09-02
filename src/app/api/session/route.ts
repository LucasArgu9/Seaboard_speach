import { createSession } from "@/lib/game/engine";
import { created, serverError } from "@/lib/http/respond";

export const dynamic = "force-dynamic";

/** POST /api/session — crea una sesión nueva (kiosk loop). */
export async function POST() {
  try {
    const { id, code } = await createSession();
    return created({ id, code });
  } catch (e) {
    return serverError(e instanceof Error ? e.message : "No se pudo crear la sesión");
  }
}
