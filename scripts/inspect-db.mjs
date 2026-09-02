import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const head = (t) => db.from(t).select("*", { count: "exact", head: true });
const c = {};
for (const t of ["questions", "question_options", "sessions", "players", "answers", "round_scores"]) {
  c[t] = (await head(t)).count;
}
console.log("CONTEO ACTUAL EN TU SUPABASE:");
for (const [k, v] of Object.entries(c)) console.log(`  ${k.padEnd(16)}: ${v}`);

const { data: players } = await db
  .from("players")
  .select("first_name,last_name,career,study_year,score,correct_count,joined_at")
  .order("joined_at", { ascending: false })
  .limit(12);
console.log("\nULTIMOS PARTICIPANTES:");
for (const x of players ?? [])
  console.log(`  ${x.first_name} ${x.last_name} | ${x.career} | ${x.study_year} | ${x.score} pts | ${x.correct_count} ok`);

const { data: ans } = await db
  .from("answers")
  .select("question_id,selected_option_id,is_correct,timed_out,response_time_ms,points,created_at")
  .order("created_at", { ascending: false })
  .limit(10);
console.log("\nULTIMAS RESPUESTAS:");
for (const x of ans ?? [])
  console.log(
    `  ${x.question_id} | ${x.selected_option_id ?? "(sin responder)"} | ${x.is_correct ? "OK" : "X"} | ${x.response_time_ms}ms | ${x.points} pts`,
  );
