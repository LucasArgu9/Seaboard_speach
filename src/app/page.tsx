import { redirect } from "next/navigation";
import { createSession } from "@/lib/game/engine";

export const dynamic = "force-dynamic";

/** Kiosk: crea una sesión y manda a la pantalla grande. */
export default async function Home() {
  const { id } = await createSession();
  redirect(`/game/${id}`);
}
