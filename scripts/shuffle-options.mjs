/**
 * Reordena las opciones de cada pregunta en questions.json para que la
 * respuesta correcta NO quede siempre en la posición A, y genera el SQL
 * equivalente para sincronizar la base (supabase/updates-preguntas.sql).
 *
 *   node scripts/shuffle-options.mjs
 *   npm run db:seed        # opcional: aplica lo mismo por upsert
 */
import { readFileSync, writeFileSync } from "node:fs";

const bank = JSON.parse(readFileSync("questions.json", "utf8"));

// PRNG determinista sembrado por string (mulberry32 + xmur3).
function seeded(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = (h ^ (h >>> 16)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Idempotencia: si ya está intercalado (no todas las correctas en A), solo
// se regenera el SQL a partir del estado actual.
const allCorrectAtA = bank.questions.every((q) => q.options[0].id === q.correctOptionId);

if (allCorrectAtA)
bank.questions.forEach((q, qi) => {
  const correct = q.options.find((o) => o.id === q.correctOptionId);
  const others = q.options.filter((o) => o.id !== q.correctOptionId);

  // La correcta va rotando de posición: 0,1,2,3,0,1,2,3... (10 de cada una).
  const targetIndex = qi % 4;

  // Mezcla determinista de las otras 3.
  const rand = seeded(q.id);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }

  const ordered = [];
  let k = 0;
  for (let pos = 0; pos < 4; pos++) {
    ordered[pos] = pos === targetIndex ? correct : others[k++];
  }
  q.options = ordered;
});

writeFileSync("questions.json", JSON.stringify(bank, null, 2) + "\n", "utf8");

/* ----------------------------- SQL de sincronización ---------------------- */

const esc = (s) => `'${String(s).replace(/'/g, "''")}'`;
const LETTER = ["A", "B", "C", "D"];

const qRows = bank.questions
  .map(
    (q) =>
      `  (${esc(q.id)}, ${esc(q.prompt)}, ${esc(q.difficulty)}, ${esc(q.reference)}, ${esc(q.correctOptionId)})`,
  )
  .join(",\n");

const oRows = bank.questions
  .flatMap((q) => q.options.map((o, i) => `  (${esc(o.id)}, ${esc(o.text)}, ${i})`))
  .join(",\n");

// Comentario legible con la posición final de cada respuesta correcta.
const summary = bank.questions
  .map((q) => {
    const i = q.options.findIndex((o) => o.id === q.correctOptionId);
    return `--   ${q.id}: correcta en ${LETTER[i]}`;
  })
  .join("\n");

const sql = `-- ============================================================================
--  DESAFÍO SEABOARD · sincronizar el banco de preguntas en Supabase
--  Generado desde questions.json. Idempotente: se puede correr varias veces.
--  Pegar completo en:  Supabase -> SQL Editor -> New query -> Run
-- ============================================================================
--  Posición de la respuesta correcta tras intercalar:
${summary}
-- ============================================================================

begin;

-- 1) Preguntas: enunciado, dificultad, referencia y opción correcta ---------
update public.questions q set
  prompt            = v.prompt,
  difficulty        = v.difficulty,
  reference         = v.reference,
  correct_option_id = v.correct
from (values
${qRows}
) as v(id, prompt, difficulty, reference, correct)
where q.id = v.id;

-- 2) Opciones: texto y posición A/B/C/D (0..3), ya intercaladas ------------
--    Se quita la restricción unique(question_id,"order") mientras se reordena
--    y se vuelve a poner al final (evita choques transitorios).
alter table public.question_options drop constraint if exists question_options_unique_order;

update public.question_options o set
  text    = v.text,
  "order" = v.ord
from (values
${oRows}
) as v(id, text, ord)
where o.id = v.id;

alter table public.question_options
  add constraint question_options_unique_order unique (question_id, "order");

commit;
`;

writeFileSync("supabase/updates-preguntas.sql", sql, "utf8");
console.log("questions.json reordenado + supabase/updates-preguntas.sql generado.");
console.log(summary.replace(/^--\s+/gm, "  "));
