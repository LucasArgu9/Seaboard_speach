import { test, expect, type APIRequestContext } from "@playwright/test";
import bank from "../../questions.json";

/**
 * E2E dirigido por API (rápido y estable). Requiere:
 *   - .env.local con Supabase
 *   - migraciones aplicadas + `npm run db:seed`
 *   - el dev server (lo levanta playwright.config.ts)
 */

const CORRECT = new Map(bank.questions.map((q) => [q.id, q.correctOptionId]));
const WRONG = new Map(
  bank.questions.map((q) => [q.id, q.options.find((o) => o.id !== q.correctOptionId)!.id]),
);

async function createSession(api: APIRequestContext): Promise<string> {
  const r = await api.post("/api/session");
  expect(r.ok()).toBeTruthy();
  return (await r.json()).id as string;
}

async function join(api: APIRequestContext, id: string, name: string) {
  const r = await api.post(`/api/session/${id}/join`, {
    data: {
      firstName: name,
      lastName: "Test",
      university: "UNSA",
      career: "Ingeniería Industrial",
      year: "3°",
      contact: `${name.toLowerCase()}@test.com`,
    },
  });
  return r;
}

async function state(api: APIRequestContext, id: string) {
  const r = await api.get(`/api/session/${id}`);
  return r.json();
}

async function advance(api: APIRequestContext, id: string, rev: number) {
  await api.post(`/api/session/${id}/advance`, { data: { rev } });
}

test("ronda completa de 2 jugadores termina en ranking", async ({ request }) => {
  const id = await createSession(request);
  const p1 = await (await join(request, id, "Ana")).json();
  const p2 = await (await join(request, id, "Beto")).json();

  await request.post(`/api/session/${id}/start`);
  let s = await state(request, id);
  expect(s.status).toBe("COUNTDOWN");
  await advance(request, id, s.rev); // -> QUESTION 0

  for (let i = 0; i < 5; i++) {
    s = await state(request, id);
    expect(s.status).toBe("QUESTION");
    expect(s.question).toBeTruthy();
    const qid = s.question.id;
    // Ana acierta siempre; Beto se saltea la última pregunta.
    await request.post("/api/answer", {
      data: { sessionId: id, playerId: p1.playerId, questionId: qid, optionId: CORRECT.get(qid) },
    });
    if (i < 4) {
      await request.post("/api/answer", {
        data: { sessionId: id, playerId: p2.playerId, questionId: qid, optionId: WRONG.get(qid) },
      });
    }
    s = await state(request, id);
    await advance(request, id, s.rev); // QUESTION -> ANSWER_REVEAL
    s = await state(request, id);
    expect(s.status).toBe("ANSWER_REVEAL");
    expect(s.reveal.correctOptionId).toBe(CORRECT.get(qid));
    await advance(request, id, s.rev); // -> SCORE_UPDATE
    s = await state(request, id);
    await advance(request, id, s.rev); // -> next QUESTION or FINAL_RANKING
  }

  s = await state(request, id);
  expect(s.status).toBe("FINAL_RANKING");
  expect(s.finalRanking).toHaveLength(2);
  expect(s.finalRanking[0].firstName).toBe("Ana"); // 5 aciertos
  expect(s.finalRanking[0].rank).toBe(1);
  expect(s.finalRanking[0].score).toBeGreaterThan(s.finalRanking[1].score);
});

test("el 11º jugador es rechazado (sala llena)", async ({ request }) => {
  const id = await createSession(request);
  for (let i = 1; i <= 10; i++) {
    const r = await join(request, id, `J${i}`);
    expect(r.status()).toBe(201);
  }
  const r11 = await join(request, id, "J11");
  expect(r11.status()).toBe(409);
  expect((await r11.json()).error).toBe("full");
});

test("no se puede cambiar la respuesta (gana la primera)", async ({ request }) => {
  const id = await createSession(request);
  const p1 = await (await join(request, id, "Uno")).json();
  await (await join(request, id, "Dos")).json();
  await request.post(`/api/session/${id}/start`);
  let s = await state(request, id);
  await advance(request, id, s.rev);
  s = await state(request, id);
  const qid = s.question.id;

  await request.post("/api/answer", {
    data: { sessionId: id, playerId: p1.playerId, questionId: qid, optionId: CORRECT.get(qid) },
  });
  // segundo intento con otra opción -> debe ignorarse
  await request.post("/api/answer", {
    data: { sessionId: id, playerId: p1.playerId, questionId: qid, optionId: WRONG.get(qid) },
  });

  s = await state(request, id);
  await advance(request, id, s.rev); // -> reveal
  s = await state(request, id);
  const mine = s.reveal.perPlayer.find((p: { playerId: string }) => p.playerId === p1.playerId);
  expect(mine.selectedOptionId).toBe(CORRECT.get(qid));
  expect(mine.isCorrect).toBe(true);
});

test("jugador que no responde recibe 0 puntos", async ({ request }) => {
  const id = await createSession(request);
  const p1 = await (await join(request, id, "Activo")).json();
  const p2 = await (await join(request, id, "Ausente")).json();
  await request.post(`/api/session/${id}/start`);
  let s = await state(request, id);
  await advance(request, id, s.rev);
  s = await state(request, id);
  const qid = s.question.id;
  await request.post("/api/answer", {
    data: { sessionId: id, playerId: p1.playerId, questionId: qid, optionId: CORRECT.get(qid) },
  });
  s = await state(request, id);
  await advance(request, id, s.rev);
  s = await state(request, id);
  const ausente = s.reveal.perPlayer.find((p: { playerId: string }) => p.playerId === p2.playerId);
  expect(ausente.points).toBe(0);
  expect(ausente.isCorrect).toBe(false);
});

test("la pantalla de juego carga y muestra el QR", async ({ page, request }) => {
  const id = await createSession(request);
  await page.goto(`/game/${id}`);
  await expect(page.getByText("DESAFÍO")).toBeVisible();
  await expect(page.locator("svg").first()).toBeVisible(); // QR
});
