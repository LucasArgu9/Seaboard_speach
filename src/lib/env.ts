/**
 * Lee y valida las variables de entorno. Falla con un mensaje claro si falta algo.
 * Las `NEXT_PUBLIC_*` quedan disponibles en el navegador; el resto solo en server.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Falta la variable de entorno ${name}. Copiá .env.example a .env.local y completala.`,
    );
  }
  return value;
}

/** Solo servidor. No importar desde componentes cliente. */
export const serverEnv = {
  get supabaseUrl() {
    return required("SUPABASE_URL", process.env.SUPABASE_URL);
  },
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
  get adminPassword() {
    return required("ADMIN_PASSWORD", process.env.ADMIN_PASSWORD);
  },
  get adminSessionSecret() {
    return required("ADMIN_SESSION_SECRET", process.env.ADMIN_SESSION_SECRET);
  },
};

/** Disponible en cliente y servidor. */
export const publicEnv = {
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "",
  appBaseUrl: process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:3000",
  maxPlayers: clampInt(process.env.NEXT_PUBLIC_MAX_PLAYERS, 10, 2, 64),
};

function clampInt(raw: string | undefined, dflt: number, min: number, max: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (Number.isNaN(n)) return dflt;
  return Math.min(max, Math.max(min, n));
}
