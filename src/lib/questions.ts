/**
 * Banco de preguntas. Fuente única de verdad: `questions.json` en la raíz.
 * La app renderiza desde acá; las tablas de Supabase son solo integridad
 * referencial + estadísticas de /admin (se cargan con `npm run db:seed`).
 */
import bank from "../../questions.json";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  category: string;
  difficulty: "facil" | "media" | "dificil";
  prompt: string;
  options: QuestionOption[];
  correctOptionId: string;
  reference: string;
}

export const QUESTIONS: Question[] = bank.questions as Question[];

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return BY_ID.get(id);
}

/** Elige `n` ids de pregunta al azar, sin repetir. */
export function pickRandomQuestionIds(n: number): string[] {
  const pool = QUESTIONS.map((q) => q.id);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(n, pool.length));
}

/** PRNG determinista sembrado por string (xmur3 + mulberry32). */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
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

function shuffleWithSeed<T>(arr: readonly T[], seed: string): T[] {
  const out = [...arr];
  const rand = seededRandom(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Vista pública de una pregunta: SIN la respuesta correcta.
 * Con `seed`, el orden de las opciones se mezcla de forma determinista (misma
 * mezcla para pantalla y teléfono). Se usa el session_id para que cada ronda
 * muestre las opciones en distinto orden y no se pueda memorizar la posición.
 */
export function toPublicQuestion(q: Question, seed?: string) {
  const options = seed ? shuffleWithSeed(q.options, `${seed}:${q.id}`) : q.options;
  return {
    id: q.id,
    category: q.category,
    prompt: q.prompt,
    options: options.map((o) => ({ id: o.id, text: o.text })),
  };
}

export type PublicQuestion = ReturnType<typeof toPublicQuestion>;
