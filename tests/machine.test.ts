import { describe, it, expect } from "vitest";
import { advance, startTransition, canJoin, canStart } from "@/lib/game/machine";

describe("máquina de estados", () => {
  it("COUNTDOWN -> QUESTION 0 y arranca el timer", () => {
    const t = advance("COUNTDOWN", -1)!;
    expect(t.status).toBe("QUESTION");
    expect(t.questionIndex).toBe(0);
    expect(t.startsQuestion).toBe(true);
  });

  it("QUESTION -> ANSWER_REVEAL califica", () => {
    const t = advance("QUESTION", 0)!;
    expect(t.status).toBe("ANSWER_REVEAL");
    expect(t.grades).toBe(true);
  });

  it("ANSWER_REVEAL -> SCORE_UPDATE", () => {
    expect(advance("ANSWER_REVEAL", 2)!.status).toBe("SCORE_UPDATE");
  });

  it("SCORE_UPDATE con preguntas restantes -> siguiente QUESTION", () => {
    const t = advance("SCORE_UPDATE", 1)!;
    expect(t.status).toBe("QUESTION");
    expect(t.questionIndex).toBe(2);
    expect(t.startsQuestion).toBe(true);
  });

  it("SCORE_UPDATE en la última pregunta -> FINAL_RANKING y finaliza", () => {
    const t = advance("SCORE_UPDATE", 4)!;
    expect(t.status).toBe("FINAL_RANKING");
    expect(t.finalizes).toBe(true);
  });

  it("FINAL_RANKING no admite avanzar", () => {
    expect(advance("FINAL_RANKING", 4)).toBeNull();
  });

  it("start requiere 2..MAX jugadores desde LOBBY/WAITING", () => {
    expect(startTransition("LOBBY", 1)).toBeNull();
    expect(startTransition("LOBBY", 2)!.status).toBe("COUNTDOWN");
    expect(startTransition("QUESTION", 3)).toBeNull();
  });

  it("canJoin bloquea al superar el tope y fuera de WAITING/LOBBY", () => {
    expect(canJoin("LOBBY", 0)).toBe(true);
    expect(canJoin("COUNTDOWN", 0)).toBe(false);
    expect(canJoin("LOBBY", 10)).toBe(false);
  });

  it("canStart es falso con 1 jugador", () => {
    expect(canStart("LOBBY", 1)).toBe(false);
    expect(canStart("LOBBY", 2)).toBe(true);
  });
});
