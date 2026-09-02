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

/** Vista pública de una pregunta: SIN la respuesta correcta. */
export function toPublicQuestion(q: Question) {
  return {
    id: q.id,
    category: q.category,
    prompt: q.prompt,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
  };
}

export type PublicQuestion = ReturnType<typeof toPublicQuestion>;
