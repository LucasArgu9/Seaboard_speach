import { describe, it, expect } from "vitest";
import { rankPlayers } from "@/lib/scoring/rank";

const P = (playerId: string, score: number, correctCount: number, totalTimeMs: number) => ({
  playerId,
  firstName: playerId,
  score,
  correctCount,
  totalTimeMs,
});

describe("rankPlayers", () => {
  it("ordena por puntaje descendente", () => {
    const r = rankPlayers([P("a", 100, 1, 1000), P("b", 300, 3, 5000), P("c", 200, 2, 2000)]);
    expect(r.map((x) => x.playerId)).toEqual(["b", "c", "a"]);
    expect(r.map((x) => x.rank)).toEqual([1, 2, 3]);
  });

  it("desempata por más respuestas correctas", () => {
    const r = rankPlayers([P("a", 1000, 2, 4000), P("b", 1000, 4, 8000)]);
    expect(r[0].playerId).toBe("b");
  });

  it("si empatan puntaje y aciertos, gana el menor tiempo total", () => {
    const r = rankPlayers([P("a", 1000, 3, 9000), P("b", 1000, 3, 4000)]);
    expect(r[0].playerId).toBe("b");
  });

  it("empate total => misma posición compartida y salto de rango", () => {
    const r = rankPlayers([P("a", 1000, 3, 5000), P("b", 1000, 3, 5000), P("c", 500, 1, 3000)]);
    expect(r[0].rank).toBe(1);
    expect(r[1].rank).toBe(1);
    expect(r[0].sharedPosition).toBe(true);
    expect(r[1].sharedPosition).toBe(true);
    expect(r[2].rank).toBe(3);
    expect(r[2].sharedPosition).toBe(false);
  });
});
