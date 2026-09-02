"use client";
import type { PublicState } from "@/lib/game/types";
import { seatColor, initials } from "@/lib/ui";
import { PointsCountUp } from "@/components/motion/PointsCountUp";

export function StandScore({ state }: { state: PublicState }) {
  const gained = new Map((state.reveal?.perPlayer ?? []).map((p) => [p.playerId, p.points]));
  const rows = [...state.players].sort((a, b) => b.score - a.score);
  const last = state.currentQuestionIndex + 1 >= state.totalQuestions;

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] gap-6 p-10">
      <h1 className="text-4xl font-black">
        {last ? "Últimos puntos…" : "Tabla de posiciones"}
      </h1>
      <ul className="sb-scroll space-y-2 overflow-y-auto pr-2">
        {rows.map((p, i) => {
          const delta = gained.get(p.id) ?? 0;
          return (
            <li
              key={p.id}
              style={{ "--i": i } as React.CSSProperties}
              className="sb-anim-fade-up sb-stagger flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4"
            >
              <span className="w-8 text-center text-2xl font-black text-white/50">{i + 1}</span>
              <span
                className="grid h-11 w-11 place-items-center rounded-full text-sm font-black"
                style={{ background: seatColor(p.seat) }}
              >
                {initials(p.firstName)}
              </span>
              <span className="text-xl font-semibold">{p.firstName}</span>
              {delta > 0 && (
                <span className="sb-anim-fade rounded-full bg-green-500/25 px-2 py-0.5 text-sm font-bold text-green-300">
                  +{delta}
                </span>
              )}
              <PointsCountUp
                value={p.score}
                from={Math.max(0, p.score - delta)}
                className="ml-auto text-2xl font-black tabular-nums"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}