/**
 * Carga el banco de preguntas (questions.json) en Supabase.
 *   npm run db:seed
 * Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

interface QJson {
  questions: {
    id: string;
    category: string;
    difficulty: string;
    prompt: string;
    reference: string;
    correctOptionId: string;
    options: { id: string; text: string }[];
  }[];
}

const bank = JSON.parse(readFileSync(join(root, "questions.json"), "utf8")) as QJson;
const db = createClient(url, key, { auth: { persistSession: false } });

const questions = bank.questions.map((q) => ({
  id: q.id,
  category: q.category,
  difficulty: q.difficulty,
  prompt: q.prompt,
  reference: q.reference,
  correct_option_id: q.correctOptionId,
  active: true,
}));

const options = bank.questions.flatMap((q) =>
  q.options.map((o, i) => ({ id: o.id, question_id: q.id, text: o.text, order: i })),
);

const r1 = await db.from("questions").upsert(questions, { onConflict: "id" });
if (r1.error) throw r1.error;
const r2 = await db.from("question_options").upsert(options, { onConflict: "id" });
if (r2.error) throw r2.error;

console.log(`OK · ${questions.length} preguntas · ${options.length} opciones cargadas.`);
