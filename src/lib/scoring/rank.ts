/**
 * Ranking final con desempate — puro y testeable.
 *
 * Orden de desempate (spec):
 *   1) mayor puntaje
 *   2) mayor cantidad de respuestas correctas
 *   3) menor tiempo total de respuesta
 *   4) si sigue el empate: comparten posición
 */

export interface Rankable {
  playerId: string;
  firstName: string;
  score: number;
  correctCount: number;
  totalTimeMs: number;
}

export interface Ranked extends Rankable {
  rank: number;
  sharedPosition: boolean;
}

function tiesWith(a: Rankable, b: Rankable): boolean {
  return (
    a.score === b.score &&
    a.correctCount === b.correctCount &&
    a.totalTimeMs === b.totalTimeMs
  );
}

export function rankPlayers(players: Rankable[]): Ranked[] {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
    if (a.totalTimeMs !== b.totalTimeMs) return a.totalTimeMs - b.totalTimeMs;
    return a.firstName.localeCompare(b.firstName, "es");
  });

  const out: Ranked[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const prev = i > 0 ? sorted[i - 1] : null;
    // Rango estilo "competición": si empata con el anterior, hereda su rango.
    const rank = prev && tiesWith(p, prev) ? out[i - 1].rank : i + 1;
    out.push({ ...p, rank, sharedPosition: false });
  }

  // Marca posiciones compartidas (empate real entre 2+ jugadores).
  for (let i = 0; i < out.length; i++) {
    const shared = out.some((o, j) => j !== i && o.rank === out[i].rank);
    out[i].sharedPosition = shared;
  }

  return out;
}
