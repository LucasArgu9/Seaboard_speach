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
  input: { firstName: string; lastName: string; career: string; year: string },
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
  for (let attempt = 0; attempt < 6; attempt++) {
    if (current.length >= MAX_PLAYERS) throw new GameError("La sala está llena", "full");
    const used = new Set(current.map((p) => p.seat));
    let seat = 1;
    while (used.has(seat)) seat++;

    const { data, error } = await db
      .from("players")
      .insert({
        session_id: sessionId,
        seat,
        first_name: input.firstName,
        last_name: input.lastName,
        career: input.career,
        study_year: input.year,
      })
      .select("id, seat")
      .single();

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

  const { error } = await db.from("sessions").update(patch).eq("id", sessionId).eq("rev", session.rev);
  if (error) throw new Error(error.message);

  if (t.finalizes) {
    await writeRoundScores(sessionId);
    await db.from("sessions").update({ finished_at: new Date().toISOString() }).eq("id", sessionId);
  }

  await broadcastBump(sessionId, session.rev + 1);
  return buildPublicState(sessionId);
}

/* --------------------------------------------------------- grading + scores */

async function gradeQuestion(session: SessionRow): Promise<void> {
  const db = supabaseAdmin();
  const idx = session.current_question_index;
  const questionId = session.question_ids[idx];
  const question = getQuestion(questionId);
  if (!question || !session.question_started_at) return;

  const players = await loadPlayers(session.id);

  const { data: existing } = await db
    .from("answers")
    .select("player_id, selected_option_id, response_time_ms, timed_out")
    .eq("session_id", session.id)
    .eq("question_id", questionId);

  const byPlayer = new Map(
    (existing ?? []).map((a) => [a.player_id as string, a as Partial<AnswerRow>]),
  );

  // 1) Filas faltantes = no respondió => timeout, 0 puntos.
  const missing = players
    .filter((p) => !byPlayer.has(p.id))
    .map((p) => ({
      session_id: session.id,
      player_id: p.id,
      question_id: questionId,
      selected_option_id: null,
      is_correct: false,
      response_time_ms: QUESTION_MS,
      timed_out: true,
      points: 0,
    }));
  if (missing.length) {
    await db.from("answers").upsert(missing, {
      onConflict: "player_id,question_id",
      ignoreDuplicates: true,
    });
  }

  // 2) Califica las respuestas presentes.
  for (const p of players) {
    const a = byPlayer.get(p.id);
    if (!a) continue;
    const rt =
      typeof a.response_time_ms === "number"
        ? Math.min(Math.max(a.response_time_ms, 0), QUESTION_MS)
        : QUESTION_MS;
    const late = a.timed_out === true;
    const isCorrect = !late && a.selected_option_id === question.correctOptionId;
    const points = pointsFor(isCorrect, QUESTION_MS - rt);
    await db
      .from("answers")
      .update({ is_correct: isCorrect, points, response_time_ms: rt })
      .eq("session_id", session.id)
      .eq("question_id", questionId)
      .eq("player_id", p.id);
  }
  // 3) Recalcula acumulados de cada jugador desde TODAS sus respuestas.
  const { data: allAns } = await db
    .from("answers")
    .select("player_id, is_correct, points, response_time_ms, timed_out")
    .eq("session_id", session.id);

  const agg = new Map<string, { score: number; correct: number; time: number }>();
  for (const a of allAns ?? []) {
    const cur = agg.get(a.player_id as string) ?? { score: 0, correct: 0, time: 0 };
    cur.score += (a.points as number) ?? 0;
    if (a.is_correct) cur.correct += 1;
    if (!a.timed_out) cur.time += (a.response_time_ms as number) ?? 0;
    agg.set(a.player_id as string, cur);
  }
  for (const p of players) {
    const cur = agg.get(p.id) ?? { score: 0, correct: 0, time: 0 };
    await db
      .from("players")
      .update({ score: cur.score, correct_count: cur.correct, total_time_ms: cur.time })
      .eq("id", p.id);
  }
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
  const session = await loadSession(sessionId);
  const players = await loadPlayers(sessionId);

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
    question: showQuestion && question ? toPublicQuestion(question) : null,
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
