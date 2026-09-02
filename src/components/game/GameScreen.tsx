"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/lib/realtime/useGameState";
import { PHASE_MS, QUESTION_MS } from "@/lib/game/config";
import { StandWaiting } from "./StandWaiting";
import { StandLobby } from "./StandLobby";
import { StandCountdown } from "./StandCountdown";
import { StandQuestion } from "./StandQuestion";
import { StandReveal } from "./StandReveal";
import { StandScore } from "./StandScore";
import { StandFinal } from "./StandFinal";

/** Pequeño colchón para que el server cierre la ventana antes de calificar. */
const SETTLE_MS = 900;

export function GameScreen({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { state, connected, clockOffsetMs, refetch } = useGameState(sessionId, { pollMs: 1200 });
  const scheduledRev = useRef<number>(-1);
  const [busy, setBusy] = useState(false);

  // El offset de reloj jitterea en cada poll; lo leemos por ref para no
  // re-disparar el efecto del director (que perdería su temporizador).
  const clockOffsetRef = useRef(0);
  useEffect(() => {
    clockOffsetRef.current = clockOffsetMs;
  }, [clockOffsetMs]);

  const post = useCallback(
    async (path: string, body?: unknown) => {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      refetch();
      return res;
    },
    [refetch],
  );

  const startRound = useCallback(async () => {
    setBusy(true);
    await post(`/api/session/${sessionId}/start`);
    setBusy(false);
  }, [post, sessionId]);

  const status = state?.status;
  const rev = state?.rev;
  const questionStartedAt = state?.questionStartedAt ?? null;

  // Director: la pantalla conduce la ronda llamando a /advance en cada fase.
  // Depende SOLO de primitivos (status/rev/questionStartedAt): así el polling
  // que devuelve el mismo estado no re-ejecuta el efecto ni mata el timer.
  useEffect(() => {
    if (rev == null || status == null) return;
    if (status === "WAITING" || status === "LOBBY") return;
    if (scheduledRev.current === rev) return;
    scheduledRev.current = rev;

    const advanceNow = (thisRev: number) => {
      post(`/api/session/${sessionId}/advance`, { rev: thisRev }).then((res) => {
        // Si el POST falló, permitir reintento en el próximo poll.
        if (!res.ok && scheduledRev.current === thisRev) scheduledRev.current = -1;
      });
    };

    if (status === "FINAL_RANKING") {
      const t = setTimeout(async () => {
        try {
          const res = await fetch("/api/session", { method: "POST" });
          if (res.ok) {
            const { id } = (await res.json()) as { id: string };
            router.replace(`/game/${id}`);
          } else {
            scheduledRev.current = -1;
          }
        } catch {
          scheduledRev.current = -1;
        }
      }, PHASE_MS.FINAL_RANKING);
      return () => clearTimeout(t);
    }

    let delay: number;
    if (status === "QUESTION" && questionStartedAt) {
      const nowServer = Date.now() + clockOffsetRef.current;
      delay = questionStartedAt + QUESTION_MS + SETTLE_MS - nowServer;
    } else if (status === "COUNTDOWN") {
      delay = PHASE_MS.COUNTDOWN;
    } else if (status === "ANSWER_REVEAL") {
      delay = PHASE_MS.ANSWER_REVEAL;
    } else if (status === "SCORE_UPDATE") {
      delay = PHASE_MS.SCORE_UPDATE;
    } else {
      return;
    }

    const currentRev = rev;
    const t = setTimeout(() => advanceNow(currentRev), Math.max(0, delay));
    return () => clearTimeout(t);
  }, [status, rev, questionStartedAt, post, router, sessionId]);

  return (
    <main className="sb-stand-bg relative min-h-dvh overflow-hidden text-white">
      {!connected && (
        <div className="absolute right-4 top-4 z-40 rounded-full bg-amber/90 px-3 py-1 text-xs font-bold text-ink">
          Reconectando…
        </div>
      )}
      <div key={state?.status ?? "boot"} className="min-h-dvh">
        {!state && <Boot />}
        {state?.status === "WAITING" && <StandWaiting state={state} />}
        {state?.status === "LOBBY" && (
          <StandLobby state={state} onStart={startRound} busy={busy} />
        )}
        {state?.status === "COUNTDOWN" && <StandCountdown state={state} />}
        {state?.status === "QUESTION" && (
          <StandQuestion state={state} clockOffsetMs={clockOffsetMs} />
        )}
        {state?.status === "ANSWER_REVEAL" && <StandReveal state={state} />}
        {state?.status === "SCORE_UPDATE" && <StandScore state={state} />}
        {state?.status === "FINAL_RANKING" && <StandFinal state={state} />}
      </div>
    </main>
  );
}

function Boot() {
  return (
    <div className="grid min-h-dvh place-items-center text-white/70">
      <p className="animate-pulse text-2xl font-semibold">Preparando el desafío…</p>
    </div>
  );
}
