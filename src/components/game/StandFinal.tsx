"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PublicState } from "@/lib/game/types";
import { medal } from "@/lib/ui";
import { Confetti } from "@/components/motion/Confetti";

export function StandFinal({ state }: { state: PublicState }) {
  const [phase, setPhase] = useState<"calc" | "reveal">("calc");
  useEffect(() => {
    const t = setTimeout(() => setPhase("reveal"), 2400);
    return () => clearTimeout(t);
  }, []);

  const ranking = state.finalRanking ?? [];
  const winner = ranking.find((r) => r.rank === 1);
  const podium = ranking.filter((r) => r.rank <= 3);

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden p-10">
      <AnimatePresence mode="wait">
        {phase === "calc" ? (
          <motion.div
            key="calc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-green-400" />
            <p className="text-4xl font-black">Calculando resultados…</p>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl"
          >
            <Confetti durationMs={7000} />

            {winner && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 16 }}
                className="mb-6 rounded-3xl bg-gradient-to-br from-green-500/30 to-navy-500/20 p-8 text-center ring-2 ring-green-400"
              >
                <p className="text-xl font-bold uppercase tracking-[0.3em] text-green-300">Ganador/a</p>
                <p className="mt-1 text-6xl font-black">🥇 {winner.firstName}</p>
                <p className="mt-2 text-3xl font-black tabular-nums text-green-300">
                  {winner.score.toLocaleString("es-AR")} pts
                </p>
              </motion.div>
            )}

            <div className="mb-4 grid grid-cols-3 gap-3">
              {podium.map((p) => (
                <div
                  key={p.playerId}
                  className={`rounded-2xl p-4 text-center ${
                    p.rank === 1 ? "bg-white/15" : "bg-white/8"
                  }`}
                >
                  <p className="text-3xl">{medal(p.rank)}</p>
                  <p className="truncate text-lg font-bold">{p.firstName}</p>
                  <p className="text-sm font-black tabular-nums text-white/70">
                    {p.score.toLocaleString("es-AR")}
                  </p>
                </div>
              ))}
            </div>

            <ul className="sb-scroll max-h-[38vh] space-y-2 overflow-y-auto pr-2">
              {ranking.map((r) => (
                <li
                  key={r.playerId}
                  className="flex items-center gap-4 rounded-xl bg-white/10 px-5 py-3"
                >
                  <span className="w-12 text-center text-xl font-black">
                    {r.sharedPosition ? `${r.rank}°=` : medal(r.rank)}
                  </span>
                  <span className="text-lg font-semibold">{r.firstName}</span>
                  <span className="ml-auto text-sm text-white/50">{r.correctCount}/{state.totalQuestions} ✓</span>
                  <span className="w-24 text-right text-xl font-black tabular-nums">
                    {r.score.toLocaleString("es-AR")}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-center text-white/50">Nueva ronda en unos segundos…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
