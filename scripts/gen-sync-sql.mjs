/**
 * Genera supabase/updates-preguntas.sql: SQL idempotente que deja el banco de
 * la base IDÉNTICO a questions.json (borra las que ya no están, inserta o
 * actualiza el resto y reemplaza las opciones).
 *   node scripts/gen-sync-sql.mjs
 * Equivalente por código: npm run db:seed
 */
import { readFileSync, writeFileSync } from "node:fs";

const bank = JSON.parse(readFileSync("questions.json", "utf8"));
const esc = (s) => `'${String(s).replace(/'/g, "''")}'`;
const L = ["A", "B", "C", "D"];

const ids = bank.questions.map((q) => esc(q.id)).join(", ");
const qRows = bank.questions
  .map((q) => `  (${esc(q.id)}, ${esc(q.category)}, ${esc(q.difficulty)}, ${esc(q.prompt)}, ${esc(q.reference)}, ${esc(q.correctOptionId)}, true)`)
  .join(",\n");
const oRows = bank.questions
  .flatMap((q) => q.options.map((o, i) => `  (${esc(o.id)}, ${esc(q.id)}, ${esc(o.text)}, ${i})`))
  .join(",\n");
const summary = bank.questions
  .map((q) => `--   ${q.id}: correcta en ${L[q.options.findIndex((o) => o.id === q.correctOptionId)]}`)
  .join("\n");

writeFileSync(
  "supabase/updates-preguntas.sql",
  `-- ============================================================================
--  DESAFÍO SEABOARD · sincronizar el banco de preguntas en Supabase
--  Generado desde questions.json (${bank.questions.length} preguntas). Idempotente.
--  Pegar completo en:  Supabase -> SQL Editor -> New query -> Run
-- ============================================================================
--  Posición base de la respuesta correcta (en el juego además se mezcla por sala):
${summary}
-- ============================================================================

begin;

-- 1) Quitar las preguntas que ya no están en el banco (sus opciones caen en cascada).
--    Falla si alguna tiene respuestas guardadas: en ese caso vaciar answers antes.
delete from public.questions where id not in (${ids});

-- 2) Insertar o actualizar las preguntas.
insert into public.questions (id, category, difficulty, prompt, reference, correct_option_id, active) values
${qRows}
on conflict (id) do update set
  category          = excluded.category,
  difficulty        = excluded.difficulty,
  prompt            = excluded.prompt,
  reference         = excluded.reference,
  correct_option_id = excluded.correct_option_id,
  active            = excluded.active;

-- 3) Opciones: reemplazo completo (evita choques con unique(question_id,"order")).
delete from public.question_options;
insert into public.question_options (id, question_id, text, "order") values
${oRows};

commit;
`,
  "utf8",
);
console.log(`supabase/updates-preguntas.sql generado (${bank.questions.length} preguntas).`);
