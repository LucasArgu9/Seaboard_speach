import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { QUESTIONS } from "@/lib/questions";

export interface Breakdown {
  label: string;
  count: number;
}

export interface QuestionStat {
  id: string;
  prompt: string;
  category: string;
  difficulty: string;
  asked: number;
  correct: number;
  correctRate: number;
}

export interface AdminStats {
  totalParticipants: number;
  totalRounds: number;
  avgCorrectPerPlayer: number;
  careers: Breakdown[];
  years: Breakdown[];
  easiestQuestions: QuestionStat[];
  hardestQuestions: QuestionStat[];
  generalRanking: { firstName: string; score: number; correctCount: number }[];
}

export async function computeAdminStats(): Promise<AdminStats> {
  const db = supabaseAdmin();

  const [{ data: players }, { data: sessions }, { data: answers }] = await Promise.all([
    db.from("players").select("first_name, last_name, career, study_year, score, correct_count"),
    db.from("sessions").select("id, finished_at"),
    db.from("answers").select("question_id, is_correct"),
  ]);

  const P = players ?? [];
  const S = sessions ?? [];
  const A = answers ?? [];

  const totalParticipants = P.length;
  const totalRounds = S.filter((s) => s.finished_at != null).length;
  const avgCorrectPerPlayer =
    P.length === 0 ? 0 : P.reduce((acc, p) => acc + (p.correct_count as number), 0) / P.length;

  const careers = countBy(P.map((p) => (p.career as string) || "Sin especificar"));
  const years = countBy(P.map((p) => (p.study_year as string) || "Sin especificar"));

  const perQ = new Map<string, { asked: number; correct: number }>();
  for (const a of A) {
    const cur = perQ.get(a.question_id as string) ?? { asked: 0, correct: 0 };
    cur.asked += 1;
    if (a.is_correct) cur.correct += 1;
    perQ.set(a.question_id as string, cur);
  }
  const questionStats: QuestionStat[] = QUESTIONS.map((q) => {
    const s = perQ.get(q.id) ?? { asked: 0, correct: 0 };
    return {
      id: q.id,
      prompt: q.prompt,
      category: q.category,
      difficulty: q.difficulty,
      asked: s.asked,
      correct: s.correct,
      correctRate: s.asked === 0 ? 0 : s.correct / s.asked,
    };
  }).filter((q) => q.asked > 0);

  const easiestQuestions = [...questionStats].sort((a, b) => b.correctRate - a.correctRate).slice(0, 5);
  const hardestQuestions = [...questionStats].sort((a, b) => a.correctRate - b.correctRate).slice(0, 5);

  const generalRanking = [...P]
    .sort((a, b) => (b.score as number) - (a.score as number))
    .slice(0, 10)
    .map((p) => ({
      firstName: p.first_name as string,
      score: p.score as number,
      correctCount: p.correct_count as number,
    }));

  return {
    totalParticipants,
    totalRounds,
    avgCorrectPerPlayer,
    careers,
    years,
    easiestQuestions,
    hardestQuestions,
    generalRanking,
  };
}

function countBy(values: string[]): Breakdown[] {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

/** Filas para el CSV: una por jugador. */
export async function buildPlayersCsv(): Promise<string> {
  const db = supabaseAdmin();
  // `*` para tolerar que la migración 0004 (career_other / contact) todavía no
  // esté aplicada.
  const { data } = await db
    .from("players")
    .select("*")
    .order("joined_at", { ascending: true });

  const { data: sessions } = await db.from("sessions").select("id, code, finished_at");
  const byId = new Map((sessions ?? []).map((s) => [s.id as string, s]));

  const header = [
    "session_code",
    "session_id",
    "seat",
    "nombre",
    "apellido",
    "carrera",
    "carrera_detalle",
    "anio_cursado",
    "contacto",
    "puntaje",
    "respuestas_correctas",
    "tiempo_total_ms",
    "ingreso",
    "ronda_finalizada",
  ];
  const rows = (data ?? []).map((p) => {
    const s = byId.get(p.session_id as string);
    return [
      s?.code ?? "",
      p.session_id,
      p.seat,
      p.first_name,
      p.last_name,
      p.career,
      p.career_other ?? "",
      p.study_year,
      p.contact ?? "",
      p.score,
      p.correct_count,
      p.total_time_ms,
      p.joined_at,
      s?.finished_at ? "si" : "no",
    ];
  });

  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
