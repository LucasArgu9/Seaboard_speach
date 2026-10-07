import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import {
  getQuestion,
  pickRandomQuestionIds,
  toPublicQuestion,
} from "@/lib/questions";
import {
  ROUND_QUESTIONS,
  QUESTION_MS,
  ANSWER_GRACE_MS,
  MAX_PLAYERS,
  pointsFor,
} from "./config";
import {
  advance as advanceMachine,
  startTransition,
  canJoin,
  type GameStatus,
} from "./machine";
import { rankPlayers } from "@/lib/scoring/rank";
import type { PublicState, PublicPlayer, RevealPlayer } from "./types";

/* ------------------------------------------------------------------ helpers */

export class GameError extends Error {
  constructor(
    message: string,
    readonly code: "not_found" | "full" | "invalid_state" | "not_current_question" | "closed",
  ) {
    super(message);
  }
}

interface SessionRow {
  id: string;
  code: string;
  status: GameStatus;
  rev: number;
  current_question_index: number;
  question_started_at: string | null;
  question_ids: string[];
  total_questions: number;
  started_at: string | null;
  finished_at: string | null;
}

interface PlayerRow {
  id: string;
  session_id: string;
  seat: number;
  first_name: string;
  score: number;
  correct_count: number;
  total_time_ms: number;
}

interface AnswerRow {
  player_id: string;
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean;
  response_time_ms: number | null;
  timed_out: boolean;
  points: number;
}

function makeCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

async function loadSession(id: string): Promise<SessionRow> {
  const db = supabaseAdmin();
  const { data, error } = await db.from("sessions").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new GameError("Sesión no encontrada", "not_found");
  return data as SessionRow;
}

async function loadPlayers(sessionId: string): Promise<PlayerRow[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("players")
    .select("id, session_id, seat, first_name, score, correct_count, total_time_ms")
    .eq("session_id", sessionId)
    .order("seat", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PlayerRow[];
}

/** Broadcast efímero: solo un ping con el rev nuevo. Los clientes hacen refetch. */
async function broadcastBump(sessionId: string, rev: number): Promise<void> {
  try {
    await fetch(`${serverEnv.supabaseUrl}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serverEnv.supabaseServiceRoleKey,
        Authorization: `Bearer ${serverEnv.supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({
        messages: [{ topic: `desafio:${sessionId}`, event: "bump", payload: { rev } }],
      }),
    });
  } catch {
    // El polling del cliente cubre el fallo; no interrumpe la transición.
  }
}

/* ----------------------------------------------------------------- creación */

export async function createSession(): Promise<{ id: string; code: string }> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("sessions")
    .insert({
      code: makeCode(),
      status: "WAITING",
      rev: 0,
      current_question_index: -1,
      question_ids: pickRandomQuestionIds(ROUND_QUESTIONS),
      total_questions: ROUND_QUESTIONS,
    })
    .select("id, code")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id as string, code: data.code as string };
}

/* --------------------------------------------------------------------- join */

export async function joinSession(
  sessionId: string,
  input: {
    firstName: string;
    lastName: string;
    career: string;
    year: string;
    university?: string;
    universityOther?: string;
    careerOther?: string;
    contact?: string;
  },
): Promise<{ playerId: string; seat: number }> {
  const db = supabaseAdmin();
  const session = await loadSession(sessionId);
  const players = await loadPlayers(sessionId);

  if (!canJoin(session.status, players.length)) {
    if (players.length >= MAX_PLAYERS) throw new GameError("La sala está llena", "full");
    throw new GameError("La ronda ya empezó", "invalid_state");
  }

  // Reintenta ante colisión de `seat` por carrera entre dos ingresos casi
  // simultáneos. Cada intento relee para respetar el tope de forma estricta.
  let current = players;
  // Si la migración 0004 (university / career_other / contact) todavía no se
  // aplicó, se reintenta el insert sin esas columnas para no bloquear el ingreso.
  let withExtraCols = true;
  for (let attempt = 0; attempt < 6; attempt++) {
    if (current.length >= MAX_PLAYERS) throw new GameError("La sala está llena", "full");
    const used = new Set(current.map((p) => p.seat));
    let seat = 1;
    while (used.has(seat)) seat++;

    const baseRow: Record<string, unknown> = {
      session_id: sessionId,
      seat,
      first_name: input.firstName,
      last_name: input.lastName,
      career: input.career,
      study_year: input.year,
    };
    const row = withExtraCols
      ? {
          ...baseRow,
          university: input.university ?? "",
          university_other: input.universityOther ?? "",
          career_other: input.careerOther ?? "",
          contact: input.contact ?? "",
        }
      : baseRow;

    const { data, error } = await db
      .from("players")
      .insert(row)
      .select("id, seat")
      .single();

    // Columna inexistente: 42703 (Postgres) o PGRST204 (cache de PostgREST).
    const missingColumn =
      !!error &&
      (error.code === "42703" ||
        error.code === "PGRST204" ||
        /Could not find the '.*' column/i.test(error.message ?? ""));
    if (missingColumn && withExtraCols) {
      withExtraCols = false;
      continue; // reintenta el mismo asiento sin las columnas nuevas
    }

    if (!error) {
      const nextStatus: GameStatus = session.status === "WAITING" ? "LOBBY" : session.status;
      await bumpAndBroadcast(sessionId, session, nextStatus);
      return { playerId: data.id as string, seat: data.seat as number };
    }
    if (error.code !== "23505") throw new Error(error.message);
    current = await loadPlayers(sessionId);
  }
  throw new GameError("No se pudo asignar lugar, probá de nuevo", "invalid_state");
}

/* -------------------------------------------------------------------- start */

export async function startRound(sessionId: string): Promise<PublicState> {
  const session = await loadSession(sessionId);
  const players = await loadPlayers(sessionId);
  const t = startTransition(session.status, players.length);
  if (!t) throw new GameError("No se puede iniciar la ronda ahora", "invalid_state");
  await bumpAndBroadcast(sessionId, session, t.status, { started_at: new Date().toISOString() });
  return buildPublicState(sessionId);
}

/* ------------------------------------------------------------------ advance */

export async function advanceRound(sessionId: string, expectedRev?: number): Promise<PublicState> {
  const db = supabaseAdmin();
  const session = await loadSession(sessionId);

  // Idempotencia: si el rev no coincide, otra pantalla ya avanzó. No-op.
  if (typeof expectedRev === "number" && expectedRev !== session.rev) {
    return buildPublicState(sessionId);
  }

  const t = advanceMachine(session.status, session.current_question_index);
  if (!t) throw new GameError("El estado actual no admite avanzar", "invalid_state");

  const patch: Record<string, unknown> = {
    status: t.status,
    current_question_index: t.questionIndex,
    rev: session.rev + 1,
  };
  if (t.startsQuestion) patch.question_started_at = new Date().toISOString();

  if (t.grades) {
    await gradeQuestion(session);
  }

  // El ranking final se escribe ANTES de pasar a FINAL_RANKING: así ningún
  // cliente ve ese estado con la tabla vacía.
  if (t.finalizes) {
    await writeRoundScores(sessionId);
    patch.finished_at = new Date().toISOString();
  }

  const { error } = await db.from("sessions").update(patch).eq("id", sessionId).eq("rev", session.rev);
  if (error) throw new Error(error.message);

  // Avisar a los clientes y armar la respuesta no dependen entre sí.
  const [, state] = await Promise.all([
    broadcastBump(sessionId, session.rev + 1),
    buildPublicState(sessionId),
  ]);
  return state;
}

/* --------------------------------------------------------- grading + scores */

async function gradeQuestion(session: SessionRow): Promise<void> {
  const db = supabaseAdmin();
  const idx = session.current_question_index;
  const questionId = session.question_ids[idx];
  const question = getQuestion(questionId);
  if (!question || !session.question_started_at) return;

  // Todo se calcula en memoria: 2 lecturas en paralelo + 2 escrituras en lote en
  // paralelo (antes eran ~3 consultas por jugador, una detrás de otra).
  const [players, answersRes] = await Promise.all([
    loadPlayers(session.id),
    db
      .from("answers")
      .select("player_id, question_id, selected_option_id, is_correct, response_time_ms, timed_out, points")
      .eq("session_id", session.id),
  ]);
  const allAns = (answersRes.data ?? []) as (AnswerRow & { question_id: string })[];

  const current = new Map(allAns.filter((a) => a.question_id === questionId).map((a) => [a.player_id, a]));

  // Calificación de ESTA pregunta. Sin fila = no respondió => timeout, 0 puntos.
  const graded = new Map<string, AnswerRow>();
  for (const p of players) {
    const a = current.get(p.id);
    if (!a) {
      graded.set(p.id, {
        player_id: p.id,
        question_id: questionId,
        selected_option_id: null,
        is_correct: false,
        response_time_ms: QUESTION_MS,
        timed_out: true,
        points: 0,
      });
      continue;
    }
    const rt =
      typeof a.response_time_ms === "number"
        ? Math.min(Math.max(a.response_time_ms, 0), QUESTION_MS)
        : QUESTION_MS;
    const isCorrect = a.timed_out !== true && a.selected_option_id === question.correctOptionId;
    graded.set(p.id, {
      player_id: p.id,
      question_id: questionId,
      selected_option_id: a.selected_option_id,
      is_correct: isCorrect,
      response_time_ms: rt,
      timed_out: a.timed_out === true,
      points: pointsFor(isCorrect, QUESTION_MS - rt),
    });
  }

  // Acumulados de cada jugador: respuestas de las otras preguntas + esta ya calificada.
  const agg = new Map<string, { score: number; correct: number; time: number }>();
  const addToAgg = (a: AnswerRow) => {
    const cur = agg.get(a.player_id) ?? { score: 0, correct: 0, time: 0 };
    cur.score += a.points ?? 0;
    if (a.is_correct) cur.correct += 1;
    if (!a.timed_out) cur.time += a.response_time_ms ?? 0;
    agg.set(a.player_id, cur);
  };
  for (const a of allAns) if (a.question_id !== questionId) addToAgg(a);
  for (const a of graded.values()) addToAgg(a);

  // Las filas faltantes se insertan con ignoreDuplicates: si justo entró una
  // respuesta tardía mientras se calificaba, no se pisa.
  const toRow = (a: AnswerRow) => ({ session_id: session.id, ...a });
  const presentRows = [...graded.values()].filter((a) => current.has(a.player_id)).map(toRow);
  const missingRows = [...graded.values()].filter((a) => !current.has(a.player_id)).map(toRow);
  const playerRows = players.map((p) => {
    const cur = agg.get(p.id) ?? { score: 0, correct: 0, time: 0 };
    return {
      id: p.id,
      session_id: p.session_id,
      seat: p.seat,
      first_name: p.first_name,
      score: cur.score,
      correct_count: cur.correct,
      total_time_ms: cur.time,
    };
  });

  const [wa, wm, wp] = await Promise.all([
    presentRows.length
      ? db.from("answers").upsert(presentRows, { onConflict: "player_id,question_id" })
      : Promise.resolve({ error: null }),
    missingRows.length
      ? db.from("answers").upsert(missingRows, { onConflict: "player_id,question_id", ignoreDuplicates: true })
      : Promise.resolve({ error: null }),
    db.from("players").upsert(playerRows, { onConflict: "id" }),
  ]);
  for (const r of [wa, wm, wp]) if (r.error) throw new Error(r.error.message);
}

async function writeRoundScores(sessionId: string): Promise<void> {
  const db = supabaseAdmin();
  const players = await loadPlayers(sessionId);
  const ranked = rankPlayers(
    players.map((p) => ({
      playerId: p.id,
      firstName: p.first_name,
      score: p.score,
      correctCount: p.correct_count,
      totalTimeMs: p.total_time_ms,
    })),
  );
  const rows = ranked.map((r) => ({
    session_id: sessionId,
    player_id: r.playerId,
    first_name: r.firstName,
    score: r.score,
    correct_count: r.correctCount,
    total_time_ms: r.totalTimeMs,
    rank: r.rank,
    shared_position: r.sharedPosition,
  }));
  if (rows.length) {
    await db.from("round_scores").upsert(rows, { onConflict: "session_id,player_id" });
  }
}

/* -------------------------------------------------------- estado público */

export async function buildPublicState(
  sessionId: string,
  viewerPlayerId?: string,
): Promise<PublicState> {
  const db = supabaseAdmin();
  const [session, players] = await Promise.all([loadSession(sessionId), loadPlayers(sessionId)]);

  const publicPlayers: PublicPlayer[] = players
    .map((p) => ({
      id: p.id,
      seat: p.seat,
      firstName: p.first_name,
      score: p.score,
      correctCount: p.correct_count,
    }))
    .sort((a, b) => b.score - a.score || a.seat - b.seat);

  const idx = session.current_question_index;
  const questionId = idx >= 0 ? session.question_ids[idx] : undefined;
  const question = questionId ? getQuestion(questionId) : undefined;

  const showQuestion =
    question && (session.status === "QUESTION" || session.status === "ANSWER_REVEAL" || session.status === "SCORE_UPDATE");

  let answeredCount = 0;
  if (question && session.status === "QUESTION") {
    const { count } = await db
      .from("answers")
      .select("player_id", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("question_id", question.id);
    answeredCount = count ?? 0;
  }

  let reveal: PublicState["reveal"] = null;
  if (question && (session.status === "ANSWER_REVEAL" || session.status === "SCORE_UPDATE")) {
    const { data: ans } = await db
      .from("answers")
      .select("player_id, selected_option_id, is_correct, points")
      .eq("session_id", sessionId)
      .eq("question_id", question.id);
    const byPlayer = new Map((ans ?? []).map((a) => [a.player_id as string, a]));
    const perPlayer: RevealPlayer[] = players.map((p) => {
      const a = byPlayer.get(p.id);
      return {
        playerId: p.id,
        firstName: p.first_name,
        selectedOptionId: (a?.selected_option_id as string | null) ?? null,
        isCorrect: Boolean(a?.is_correct),
        points: (a?.points as number) ?? 0,
      };
    });
    reveal = { questionId: question.id, correctOptionId: question.correctOptionId, perPlayer };
  }

  let finalRanking: PublicState["finalRanking"] = null;
  if (session.status === "FINAL_RANKING") {
    const { data: rs } = await db
      .from("round_scores")
      .select("player_id, first_name, score, correct_count, rank, shared_position")
      .eq("session_id", sessionId)
      .order("rank", { ascending: true });
    finalRanking = (rs ?? []).map((r) => ({
      rank: r.rank as number,
      playerId: r.player_id as string,
      firstName: r.first_name as string,
      score: r.score as number,
      correctCount: r.correct_count as number,
      sharedPosition: Boolean(r.shared_position),
    }));
  }

  let you: PublicState["you"] = null;
  if (viewerPlayerId) {
    const me = players.find((p) => p.id === viewerPlayerId);
    if (me) {
      let answeredCurrent = false;
      let selectedOptionId: string | null = null;
      if (question && (session.status === "QUESTION" || session.status === "ANSWER_REVEAL" || session.status === "SCORE_UPDATE")) {
        const { data: mine } = await db
          .from("answers")
          .select("selected_option_id")
          .eq("session_id", sessionId)
          .eq("question_id", question.id)
          .eq("player_id", viewerPlayerId)
          .maybeSingle();
        answeredCurrent = Boolean(mine);
        selectedOptionId = (mine?.selected_option_id as string | null) ?? null;
      }
      you = { playerId: me.id, seat: me.seat, answeredCurrent, selectedOptionId };
    }
  }

  return {
    id: session.id,
    code: session.code,
    status: session.status,
    rev: session.rev,
    currentQuestionIndex: idx,
    totalQuestions: session.total_questions,
    questionStartedAt:
      session.status === "QUESTION" && session.question_started_at
        ? Date.parse(session.question_started_at)
        : null,
    serverNow: Date.now(),
    answeredCount,
    players: publicPlayers,
    question: showQuestion && question ? toPublicQuestion(question, sessionId) : null,
    reveal,
    finalRanking,
    you,
  };
}

/* --------------------------------------------------------------- internos */

async function bumpAndBroadcast(
  sessionId: string,
  session: SessionRow,
  nextStatus: GameStatus,
  extraPatch: Record<string, unknown> = {},
): Promise<void> {
  const db = supabaseAdmin();
  const newRev = session.rev + 1;
  const { error } = await db
    .from("sessions")
    .update({ status: nextStatus, rev: newRev, ...extraPatch })
    .eq("id", sessionId);
  if (error) throw new Error(error.message);
  await broadcastBump(sessionId, newRev);
}

/** Fin forzado (admin): salta directo a FINAL_RANKING con lo que haya. */
export async function forceFinish(sessionId: string): Promise<PublicState> {
  const db = supabaseAdmin();
  const session = await loadSession(sessionId);
  if (session.status === "FINAL_RANKING") return buildPublicState(sessionId);
  await writeRoundScores(sessionId);
  await db
    .from("sessions")
    .update({ status: "FINAL_RANKING", rev: session.rev + 1, finished_at: new Date().toISOString() })
    .eq("id", sessionId);
  await broadcastBump(sessionId, session.rev + 1);
  return buildPublicState(sessionId);
}

/* -------------------------------------------------------------- respuestas */

export async function submitAnswer(input: {
  sessionId: string;
  playerId: string;
  questionId: string;
  optionId: string;
}): Promise<void> {
  const db = supabaseAdmin();
  const session = await loadSession(input.sessionId);

  if (session.status !== "QUESTION" || !session.question_started_at) {
    throw new GameError("No hay una pregunta abierta", "invalid_state");
  }
  const idx = session.current_question_index;
  if (session.question_ids[idx] !== input.questionId) {
    throw new GameError("Esa no es la pregunta actual", "not_current_question");
  }
  const question = getQuestion(input.questionId);
  if (!question || !question.options.some((o) => o.id === input.optionId)) {
    throw new GameError("Opción inválida", "not_current_question");
  }

  const elapsed = Math.max(0, Date.now() - Date.parse(session.question_started_at));
  const responseTimeMs = Math.min(elapsed, QUESTION_MS);
  const timedOut = elapsed > QUESTION_MS + ANSWER_GRACE_MS;

  // ignoreDuplicates => ON CONFLICT DO NOTHING: gana la primera respuesta.
  await db.from("answers").upsert(
    {
      session_id: input.sessionId,
      player_id: input.playerId,
      question_id: input.questionId,
      selected_option_id: input.optionId,
      response_time_ms: responseTimeMs,
      timed_out: timedOut,
      is_correct: false,
      points: 0,
    },
    { onConflict: "player_id,question_id", ignoreDuplicates: true },
  );
}
