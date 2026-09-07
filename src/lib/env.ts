/**
 * Lee y valida las variables de entorno. Falla con un mensaje claro si falta algo.
 * Las `NEXT_PUBLIC_*` quedan disponibles en el navegador; el resto solo en server.
 *
 * Acepta tanto los nombres "clásicos" de Supabase (anon / service_role) como los
 * nuevos (publishable / secret) y los que inyecta la integración de v0 / Vercel.
 */

function firstNonEmpty(...names: string[]): { name: string; value: string } | null {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim() !== "") return { name: n, value: v.trim() };
  }
  return null;
}

function requireEnv(label: string, names: string[]): string {
  const hit = firstNonEmpty(...names);
  if (!hit) {
    throw new Error(
      `Falta ${label}. Definí alguna de estas variables de entorno: ${names.join(", ")}.`,
    );
  }
  return hit.value;
}

/** Solo servidor. No importar desde componentes cliente. */
export const serverEnv = {
  get supabaseUrl() {
    return requireEnv("la URL de Supabase", ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]);
  },
  get supabaseServiceRoleKey() {
    return requireEnv("la service_role / secret key de Supabase", [
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_SECRET_KEY",
      "SUPABASE_SERVICE_KEY",
    ]);
  },
  get adminPassword() {
    return requireEnv("la contraseña del panel", ["ADMIN_PASSWORD"]);
  },
  get adminSessionSecret() {
    return requireEnv("el secreto de sesión del panel", ["ADMIN_SESSION_SECRET"]);
  },
};

/** Disponible en cliente y servidor. */
export const publicEnv = {
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    "",
  appBaseUrl: process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:3000",
  maxPlayers: clampInt(process.env.NEXT_PUBLIC_MAX_PLAYERS, 10, 2, 64),
  /** Clave para desbloquear la pantalla del stand (una vez por navegador). */
  kioskKey: process.env.NEXT_PUBLIC_KIOSK_KEY?.trim() || "aumentoparalucas",
};

function clampInt(raw: string | undefined, dflt: number, min: number, max: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (Number.isNaN(n)) return dflt;
  return Math.min(max, Math.max(min, n));
}
