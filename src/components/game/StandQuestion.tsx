"use client";
import { motion } from "framer-motion";
import type { PublicState } from "@/lib/game/types";
import { OPTION_LETTERS, OPTION_CLASS } from "@/lib/ui";
import { TimerRing } from "@/components/motion/TimerRing";

export function StandQuestion({
  state,
  clockOffsetMs,
}: {
  state: PublicState;
  clockOffsetMs: number;
}) {
  const q = state.question;
  if (!q || state.questionStartedAt == null) return null;
  const n = state.currentQuestionIndex + 1;

  return (
    <div className="grid min-h-dvh grid-rows-[auto_auto_1fr] gap-6 p-10">
      <div className="flex items-center justify-between">
        <span className="text-xl font-black uppercase tracking-[0.25em] text-green-300">
          Pregunta {n} de {state.totalQuestions}
        </span>
        <span className="rounded-full bg-white/10 px-4 py-1 text-lg font-bold tabular-nums">
          {state.answeredCount}/{state.players.length} respondieron
        </span>
      </div>

      <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-balance text-5xl font-black leading-tight xl:text-6xl"
        >
          {q.prompt}
        </motion.h1>
        <TimerRing
          startedAt={state.questionStartedAt}
          durationMs={10_000}
          clockOffsetMs={clockOffsetMs}
          size={200}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 self-end sm:grid-cols-2">
        {q.options.map((opt, i) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.06 * i }}
            className={`${OPTION_CLASS[i]} flex items-center gap-4 rounded-2xl p-5 text-2xl font-bold`}
            style={{ background: "color-mix(in srgb, var(--opt) 82%, #06122c)" }}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 text-2xl font-black">
              {OPTION_LETTERS[i]}
            </span>
            <span className="text-balance">{opt.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
