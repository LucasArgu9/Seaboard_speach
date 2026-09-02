/**
 * Máquina de estados de la ronda — lógica pura y testeable.
 *
 * WAITING ─join─▶ LOBBY ─start─▶ COUNTDOWN ─▶ QUESTION ─▶ ANSWER_REVEAL ─▶ SCORE_UPDATE
 *                                                 ▲                              │
 *                                                 └──────(quedan preguntas)──────┘
 *                                                                                │
 *                                                            (última pregunta)   ▼
 *                                                                        FINAL_RANKING
 */
import { ROUND_QUESTIONS, MIN_PLAYERS, MAX_PLAYERS } from "./config";

export type GameStatus =
  | "WAITING"
  | "LOBBY"
  | "COUNTDOWN"
  | "QUESTION"
  | "ANSWER_REVEAL"
  | "SCORE_UPDATE"
  | "FINAL_RANKING";

export const PHONE_JOINABLE: GameStatus[] = ["WAITING", "LOBBY"];

/** ¿Se puede iniciar la ronda? */
export function canStart(status: GameStatus, playerCount: number): boolean {
  return (
    (status === "WAITING" || status === "LOBBY") &&
    playerCount >= MIN_PLAYERS &&
    playerCount <= MAX_PLAYERS
  );
}

/** ¿Se puede sumar un jugador más? */
export function canJoin(status: GameStatus, playerCount: number): boolean {
  return PHONE_JOINABLE.includes(status) && playerCount < MAX_PLAYERS;
}

export interface Transition {
  status: GameStatus;
  questionIndex: number;
  /** El servidor debe setear question_started_at = now() al entrar. */
  startsQuestion: boolean;
  /** El servidor debe calificar respuestas y acumular puntajes. */
  grades: boolean;
  /** El servidor debe escribir round_scores y finished_at. */
  finalizes: boolean;
}

/**
 * Siguiente estado tras un "advance" conducido por la pantalla grande.
 * `questionIndex` es el índice actual (0..ROUND_QUESTIONS-1); -1 antes de empezar.
 * Devuelve null si el estado actual no admite advance.
 */
export function advance(status: GameStatus, questionIndex: number): Transition | null {
  switch (status) {
    case "COUNTDOWN":
      return { status: "QUESTION", questionIndex: 0, startsQuestion: true, grades: false, finalizes: false };
    case "QUESTION":
      return { status: "ANSWER_REVEAL", questionIndex, startsQuestion: false, grades: true, finalizes: false };
    case "ANSWER_REVEAL":
      return { status: "SCORE_UPDATE", questionIndex, startsQuestion: false, grades: false, finalizes: false };
    case "SCORE_UPDATE": {
      const isLast = questionIndex + 1 >= ROUND_QUESTIONS;
      if (isLast) {
        return { status: "FINAL_RANKING", questionIndex, startsQuestion: false, grades: false, finalizes: true };
      }
      return {
        status: "QUESTION",
        questionIndex: questionIndex + 1,
        startsQuestion: true,
        grades: false,
        finalizes: false,
      };
    }
    default:
      return null;
  }
}

/** Transición de arranque (start): LOBBY/WAITING -> COUNTDOWN. */
export function startTransition(status: GameStatus, playerCount: number): Transition | null {
  if (!canStart(status, playerCount)) return null;
  return { status: "COUNTDOWN", questionIndex: -1, startsQuestion: false, grades: false, finalizes: false };
}
