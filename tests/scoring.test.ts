import { describe, it, expect } from "vitest";
import { grade } from "@/lib/scoring/score";
import { pointsFor } from "@/lib/game/config";

const CORRECT = "qX-a";
const base = { questionStartedAt: 0, correctOptionId: CORRECT };

describe("pointsFor", () => {
  it("respuesta inmediata ≈ 1000", () => {
    expect(pointsFor(true, 10_000)).toBe(1000);
  });
  it("mitad de tiempo ≈ 750", () => {
    expect(pointsFor(true, 5_000)).toBe(750);
  });
  it("último segundo ≈ 550", () => {
    expect(pointsFor(true, 1_000)).toBe(550);
  });
  it("incorrecta => 0 sin importar la velocidad", () => {
    expect(pointsFor(false, 10_000)).toBe(0);
  });
});

describe("grade", () => {
  it("correcta y rápida da puntaje alto", () => {
    const r = grade({ ...base, answeredAt: 500, selectedOptionId: CORRECT });
    expect(r.isCorrect).toBe(true);
    expect(r.points).toBeGreaterThan(950);
    expect(r.timedOut).toBe(false);
  });

  it("correcta al filo (10.0s) sigue contando pero con puntaje mínimo", () => {
    const r = grade({ ...base, answeredAt: 9_999, selectedOptionId: CORRECT });
    expect(r.isCorrect).toBe(true);
    expect(r.points).toBeGreaterThanOrEqual(500);
    expect(r.points).toBeLessThan(510);
  });

  it("dentro de la gracia de red (10.5s) todavía cuenta", () => {
    const r = grade({ ...base, answeredAt: 10_500, selectedOptionId: CORRECT });
    expect(r.isCorrect).toBe(true);
    expect(r.points).toBe(500);
  });

  it("fuera de ventana (11s) => 0 y timedOut", () => {
    const r = grade({ ...base, answeredAt: 11_000, selectedOptionId: CORRECT });
    expect(r.isCorrect).toBe(false);
    expect(r.timedOut).toBe(true);
    expect(r.points).toBe(0);
  });

  it("opción incorrecta => 0", () => {
    const r = grade({ ...base, answeredAt: 800, selectedOptionId: "qX-b" });
    expect(r.isCorrect).toBe(false);
    expect(r.points).toBe(0);
  });

  it("sin respuesta => timedOut, 0 puntos, tiempo máximo", () => {
    const r = grade({ ...base, answeredAt: 0, selectedOptionId: null });
    expect(r.timedOut).toBe(true);
    expect(r.responseTimeMs).toBe(10_000);
    expect(r.points).toBe(0);
  });
});
