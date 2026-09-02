"use client";
import type { PublicState } from "@/lib/game/types";
import { OPTION_LETTERS } from "@/lib/ui";

export function StandReveal({ state }: { state: PublicState }) {
  const q = state.question;
  const reveal = state.reveal;
  if (!q || !reveal) return null;

  const correctIdx = q.options.findIndex((o) => o.id === reveal.correctOptionId);
  const correctText = q.options[correctIdx]?.text ?? "";
  const gained = [...reveal.perPlayer].sort((a, b) => b.points - a.points);

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] gap-8 p-10">
      <div>
        <p className="text-xl font-black uppercase tracking-[0.25em] text-white/50">
          Pregunta {state.currentQuestionIndex + 1} de {state.totalQuestions}
        </p>
        <h1 className="mt-1 text-4xl font-black leading-tight">{q.prompt}</h1>
      </div>

      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="sb-anim-pop rounded-3xl bg-green-500/15 p-8 ring-2 ring-green-400">
          <p className="text-lg font-bold uppercase tracking-widest text-green-300">
            Respuesta correcta
          </p>
          <p className="mt-2 flex items-center gap-3 text-4xl font-black">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-green-500 text-2xl">
              {OPTION_LETTERS[correctIdx]}
            </span>
            {correctText}
          </p>
        </div>

        <div className="sb-scroll max-h-[52vh] space-y-2 overflow-y-auto pr-2">
          {gained.map((p, i) => (
            <div
              key={p.playerId}
              style={{ "--i": i } as React.CSSProperties}
              className="sb-anim-slide-left sb-stagger flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-xl"
            >
              <span className="font-semibold">{p.firstName}</span>
              <span
                className={`ml-auto font-black tabular-nums ${
                  p.points > 0 ? "text-green-300" : "text-white/40"
                }`}
              >
                {p.points > 0 ? `+${p.points}` : "+0"}
              </span>
              <span>{p.isCorrect ? "✅" : "❌"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}