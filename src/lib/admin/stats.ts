import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { QUESTIONS, getQuestion } from "@/lib/questions";

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

export interface ParticipantRow {
  firstName: string;
  lastName: string;
  university: string;
  career: string;
  year: string;
  contact: string;
  score: number;
  correctCount: number;
  sessionCode: string;
  joinedAt: string;
}

export interface AdminStats {
  totalParticipants: number;
  totalRounds: number;
  totalSessions: number;
  totalAnswers: number;
  avgCorrectPerPlayer: number;
  universities: Breakdown[];
  careers: Breakdown[];
  years: Breakdown[];
  easiestQuestions: QuestionStat[];
  hardestQuestions: QuestionStat[];
  generalRanking: { firstName: string; score: number; correctCount: number }[];
  participants: ParticipantRow[];
}

/** Nombre de universidad a mostrar (usa el texto libre si la eligió "Otra"). */
function uniLabel(p: Record<string, unknown>): string {
  return (
    ((p.university_other as string) || "").trim() ||
    ((p.university as string) || "").trim() ||
    "Sin especificar"
  );
}
function careerLabel(p: Record<string, unknown>): string {
  return (
    ((p.career_other as string) || "").trim() ||
    ((p.career as string) || "").trim() ||
    "Sin especificar"
  );
}

export async function computeAdminStats(): Promise<AdminStats> {
  const db = supabaseAdmin();

  const [{ data: players }, { data: sessions }, { data: answers }] = await Promise.all([
    db.from("players").select("*").order("joined_at", { ascending: true }),
    db.from("sessions").select("id, code, finished_at"),
    db.from("answers").select("question_id, is_correct"),
  ]);

  const P = (players ?? []) as Record<string, unknown>[];
  const S = sessions ?? [];
  const A = answers ?? [];
  const codeById = new Map((S ?? []).map((s) => [s.id as string, (s.code as string) ?? ""]));

  const totalParticipants = P.length;
  const totalRounds = S.filter((s) => s.finished_at != null).length;
  const totalSessions = S.length;
  const totalAnswers = A.length;
  const avgCorrectPerPlayer =
    P.length === 0 ? 0 : P.reduce((acc, p) => acc + ((p.correct_count as number) ?? 0), 0) / P.length;

  const universities = countBy(P.map(uniLabel));
  const careers = countBy(P.map(careerLabel));
  const years = countBy(P.map((p) => (p.study_year as string) || "Sin especificar"));

  const participants: ParticipantRow[] = P.map((p) => ({
    firstName: (p.first_name as string) ?? "",
    lastName: (p.last_name as string) ?? "",
    university: uniLabel(p),
    career: careerLabel(p),
    year: (p.study_year as string) ?? "",
    contact: (p.contact as string) ?? "",
    score: (p.score as number) ?? 0,
    correctCount: (p.correct_count as number) ?? 0,
    sessionCode: codeById.get(p.session_id as string) ?? "",
    joinedAt: (p.joined_at as string) ?? "",
  })).reverse(); // más recientes primero

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
    totalSessions,
    totalAnswers,
    avgCorrectPerPlayer,
    universities,
    careers,
    years,
    easiestQuestions,
    hardestQuestions,
    generalRanking,
    participants,
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
    "universidad",
    "universidad_detalle",
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
      p.university ?? "",
      p.university_other ?? "",
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

/** CSV con una fila por respuesta enviada (detalle para RRHH / análisis). */
export async function buildAnswersCsv(): Promise<string> {
  const db = supabaseAdmin();
  const [{ data: answers }, { data: players }, { data: sessions }, { data: options }] =
    await Promise.all([
      db.from("answers").select("*").order("created_at", { ascending: true }),
      db.from("players").select("*"),
      db.from("sessions").select("id, code"),
      db.from("question_options").select("id, text"),
    ]);

  const P = new Map((players ?? []).map((p) => [p.id as string, p as Record<string, unknown>]));
  const codeById = new Map((sessions ?? []).map((s) => [s.id as string, (s.code as string) ?? ""]));
  const optText = new Map((options ?? []).map((o) => [o.id as string, o.text as string]));

  const header = [
    "momento",
    "sala",
    "jugador",
    "universidad",
    "carrera",
    "pregunta_id",
    "pregunta",
    "respondio",
    "respuesta_correcta",
    "acerto",
    "sin_responder",
    "segundos",
    "puntos",
  ];
  const rows = (answers ?? []).map((a) => {
    const p = P.get(a.player_id as string) ?? {};
    const q = getQuestion(a.question_id as string);
    return [
      a.created_at,
      codeById.get(a.session_id as string) ?? "",
      `${(p.first_name as string) ?? ""} ${(p.last_name as string) ?? ""}`.trim(),
      uniLabel(p),
      careerLabel(p),
      a.question_id,
      q?.prompt ?? "",
      optText.get(a.selected_option_id as string) ?? "",
      q ? (optText.get(q.correctOptionId) ?? "") : "",
      a.is_correct ? "si" : "no",
      a.timed_out ? "si" : "no",
      a.response_time_ms == null ? "" : (Number(a.response_time_ms) / 1000).toFixed(1),
      a.points ?? 0,
    ];
  });

  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}
