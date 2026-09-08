/**
 * Borra TODAS las respuestas, rankings, jugadores y salas.
 * NO toca el banco de preguntas (questions / question_options).
 *
 *   npm run db:wipe
 *
 * Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });
const ZERO = "00000000-0000-0000-0000-000000000000";

const count = async (t) => (await db.from(t).select("*", { count: "exact", head: true })).count ?? 0;

console.log("Antes  →", {
  answers: await count("answers"),
  round_scores: await count("round_scores"),
  players: await count("players"),
  sessions: await count("sessions"),
});

// Orden hijo → padre (igual hay ON DELETE CASCADE, pero así es explícito).
for (const [table, col] of [
  ["answers", "id"],
  ["round_scores", "player_id"],
  ["players", "id"],
  ["sessions", "id"],
]) {
  const { error } = await db.from(table).delete().neq(col, ZERO);
  if (error) {
    console.error(`Error borrando ${table}:`, error.message);
    process.exit(1);
  }
}

console.log("Después →", {
  answers: await count("answers"),
  round_scores: await count("round_scores"),
  players: await count("players"),
  sessions: await count("sessions"),
});
console.log("Listo. El banco de preguntas quedó intacto.");
