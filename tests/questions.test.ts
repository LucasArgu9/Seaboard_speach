import { describe, it, expect } from "vitest";
import { QUESTIONS, pickRandomQuestionIds, toPublicQuestion } from "@/lib/questions";

describe("banco de preguntas", () => {
  it("tiene al menos 40 preguntas", () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(40);
  });

  it("cada pregunta: 4 opciones, ids únicos, respuesta correcta válida, referencia al speech", () => {
    const ids = new Set<string>();
    for (const q of QUESTIONS) {
      expect(q.options).toHaveLength(4);
      expect(ids.has(q.id), `id duplicado ${q.id}`).toBe(false);
      ids.add(q.id);
      const optIds = q.options.map((o) => o.id);
      expect(new Set(optIds).size).toBe(4);
      expect(optIds).toContain(q.correctOptionId);
      expect(q.reference.trim().length).toBeGreaterThan(0);
      expect(["facil", "media", "dificil"]).toContain(q.difficulty);
    }
  });

  it("cubre las categorías clave del speech", () => {
    const cats = new Set(QUESTIONS.map((q) => q.category));
    for (const c of ["historia", "productos", "sostenibilidad", "pasantias", "beneficios", "carreras-areas", "postulacion"]) {
      expect(cats.has(c), `falta categoría ${c}`).toBe(true);
    }
  });

  it("pickRandomQuestionIds devuelve 5 ids sin repetir", () => {
    const picked = pickRandomQuestionIds(5);
    expect(picked).toHaveLength(5);
    expect(new Set(picked).size).toBe(5);
  });

  it("toPublicQuestion no expone la respuesta correcta", () => {
    const pub = toPublicQuestion(QUESTIONS[0]) as Record<string, unknown>;
    expect(pub.correctOptionId).toBeUndefined();
  });
});
