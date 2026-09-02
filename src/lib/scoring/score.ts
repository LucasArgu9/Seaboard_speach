/**
 * Cálculo de puntos y del tiempo de respuesta — puro y testeable.
 * El servidor es la única autoridad: nunca se confía en el tiempo del cliente.
 */
import { QUESTION_MS, ANSWER_GRACE_MS, pointsFor } from "@/lib/game/config";

export interface GradeInput {
  /** Momento en que el servidor marcó el inicio de la pregunta. */
  questionStartedAt: number;
  /** Momento en que el servidor recibió la respuesta. */
  answeredAt: number;
  selectedOptionId: string | null;
  correctOptionId: string;
}

export interface GradeResult {
  isCorrect: boolean;
  timedOut: boolean;
  responseTimeMs: number;
  points: number;
}

/** Califica una respuesta ya recibida por el servidor. */
export function grade(input: GradeInput): GradeResult {
  const elapsed = Math.max(0, input.answeredAt - input.questionStartedAt);
  const responseTimeMs = Math.min(elapsed, QUESTION_MS);

  if (input.selectedOptionId == null) {
    return { isCorrect: false, timedOut: true, responseTimeMs: QUESTION_MS, points: 0 };
  }

  const withinWindow = elapsed <= QUESTION_MS + ANSWER_GRACE_MS;
  const isCorrect = withinWindow && input.selectedOptionId === input.correctOptionId;
  const timeLeftMs = Math.max(0, QUESTION_MS - elapsed);

  return {
    isCorrect,
    timedOut: !withinWindow,
    responseTimeMs,
    points: pointsFor(isCorrect, timeLeftMs),
  };
}

/** ¿La respuesta llegó dentro de la ventana aceptable (incluida la gracia)? */
export function isWithinWindow(questionStartedAt: number, answeredAt: number): boolean {
  return answeredAt - questionStartedAt <= QUESTION_MS + ANSWER_GRACE_MS;
}
