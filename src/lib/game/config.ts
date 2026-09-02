/**
 * Constantes del juego. Duraciones en milisegundos.
 * La pantalla grande usa estas duraciones para saber cuándo llamar a
 * POST /api/session/[id]/advance. El servidor las usa para validar la ventana
 * de respuesta y calcular puntos.
 */
import { publicEnv } from "@/lib/env";

export const ROUND_QUESTIONS = 5;

/** Ventana para responder cada pregunta. */
export const QUESTION_MS = 10_000;

/** Gracia de red: una respuesta que llega hasta 800 ms tarde todavía cuenta. */
export const ANSWER_GRACE_MS = 800;

/** Duración de cada estado que conduce la pantalla grande. */
export const PHASE_MS = {
  COUNTDOWN: 3_200,
  QUESTION: QUESTION_MS,
  ANSWER_REVEAL: 3_800,
  SCORE_UPDATE: 3_200,
  FINAL_RANKING: 18_000,
} as const;

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = publicEnv.maxPlayers;

/**
 * Puntos por respuesta correcta = 500 + 500 * (tiempo_restante / 10).
 * timeLeftMs se calcula SIEMPRE en el servidor a partir de question_started_at.
 * Incorrecta / sin respuesta / fuera de ventana => 0.
 */
export function pointsFor(isCorrect: boolean, timeLeftMs: number): number {
  if (!isCorrect) return 0;
  const frac = clamp01(timeLeftMs / QUESTION_MS);
  return Math.round(500 + 500 * frac);
}

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
