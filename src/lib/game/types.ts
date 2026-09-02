import type { GameStatus } from "./machine";
import type { PublicQuestion } from "@/lib/questions";

export type { GameStatus };

export interface PublicPlayer {
  id: string;
  seat: number;
  firstName: string;
  score: number;
  correctCount: number;
}

export interface RevealPlayer {
  playerId: string;
  firstName: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  points: number;
}

export interface RankingRow {
  rank: number;
  playerId: string;
  firstName: string;
  score: number;
  correctCount: number;
  sharedPosition: boolean;
}

/** Lo que devuelve GET /api/session/[id] y viaja (por bump) a pantalla + teléfonos. */
export interface PublicState {
  id: string;
  code: string;
  status: GameStatus;
  rev: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  /** ms epoch (reloj del servidor Next). null salvo en QUESTION. */
  questionStartedAt: number | null;
  /** ms epoch del servidor al construir la respuesta — para calcular offset de reloj. */
  serverNow: number;
  /** Cuántos jugadores ya respondieron la pregunta actual (sin revelar aciertos). */
  answeredCount: number;
  players: PublicPlayer[];
  question: PublicQuestion | null;
  reveal: {
    questionId: string;
    correctOptionId: string;
    perPlayer: RevealPlayer[];
  } | null;
  finalRanking: RankingRow[] | null;
  /** Presente solo si se pasó ?playerId= (uso del teléfono). */
  you: {
    playerId: string;
    seat: number;
    answeredCurrent: boolean;
    selectedOptionId: string | null;
  } | null;
}
