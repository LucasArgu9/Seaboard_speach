"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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

  // Director: la pantalla conduce la ronda llamando a /advance en cada fase.
  useEffect(() => {
    if (!state) return;
    const { status, rev } = state;

    if (status === "WAITING" || status === "LOBBY") return;
    if (scheduledRev.current === rev) return;
    scheduledRev.current = rev;

    let delay: number;
    if (status === "QUESTION" && state.questionStartedAt) {
      const nowServer = Date.now() + clockOffsetMs;
      delay = state.questionStartedAt + QUESTION_MS + SETTLE_MS - nowServer;
    } else if (status === "COUNTDOWN") {
      delay = PHASE_MS.COUNTDOWN;
    } else if (status === "ANSWER_REVEAL") {
      delay = PHASE_MS.ANSWER_REVEAL;
    } else if (status === "SCORE_UPDATE") {
      delay = PHASE_MS.SCORE_UPDATE;
    } else if (status === "FINAL_RANKING") {
      const t = setTimeout(async () => {
        const res = await fetch("/api/session", { method: "POST" });
        if (res.ok) {
          const { id } = (await res.json()) as { id: string };
          router.replace(`/game/${id}`);
        }
      }, PHASE_MS.FINAL_RANKING);
      return () => clearTimeout(t);
    } else {
      return;
    }

    const t = setTimeout(
      () => {
        post(`/api/session/${sessionId}/advance`, { rev });
      },
      Math.max(0, delay),
    );
    return () => clearTimeout(t);
  }, [state, clockOffsetMs, post, router, sessionId]);

  return (
    <main className="sb-stand-bg relative min-h-dvh overflow-hidden text-white">
      {!connected && (
        <div className="absolute right-4 top-4 z-40 rounded-full bg-amber/90 px-3 py-1 text-xs font-bold text-ink">
          Reconectando…
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={state?.status ?? "boot"}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="min-h-dvh"
        >
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
        </motion.div>
      </AnimatePresence>
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
