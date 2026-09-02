"use client";
import type { PublicState } from "@/lib/game/types";
import { Countdown321 } from "@/components/motion/Countdown321";

export function StandCountdown({ state }: { state: PublicState }) {
  return (
    <div className="grid min-h-dvh place-items-center p-10">
      <div className="text-center">
        <p className="mb-2 text-2xl font-bold uppercase tracking-[0.3em] text-green-300">
          Preparados
        </p>
        <Countdown321 from={3} />
        <p className="mt-2 text-xl text-white/60">{state.players.length} jugadores · 5 preguntas</p>
      </div>
    </div>
  );
}
