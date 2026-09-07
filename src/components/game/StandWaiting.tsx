"use client";
import type { PublicState } from "@/lib/game/types";
import { Wordmark } from "@/components/ui/Wordmark";
import { QrPanel } from "./QrPanel";

export function StandWaiting({ state }: { state: PublicState }) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-6 p-10">
      <header className="flex items-center justify-between">
        <Wordmark tone="dark" showTagline className="text-4xl sm:text-5xl" />
        <span className="rounded-full bg-white/10 px-4 py-1 text-sm font-semibold">Modo feria</span>
      </header>

      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="sb-anim-fade-up space-y-5">
          <h1 className="text-6xl font-black leading-[1.05] xl:text-7xl">
            DESAFÍO<br />
            <span className="text-green-400">SEABOARD</span>
          </h1>
          <p className="max-w-xl text-2xl text-white/80">¿Cuánto aprendiste sobre nosotros?</p>
          <ul className="space-y-1 text-lg text-white/70">
            <li>· 5 preguntas · 10 segundos cada una</li>
            <li>· Puntos por acertar y por velocidad</li>
            <li>· Ranking en vivo al final</li>
          </ul>
          <p className="pt-4 text-3xl font-bold text-green-300">Escaneá el QR para entrar →</p>
        </div>

        <div className="sb-anim-pop justify-self-center">
          <QrPanel sessionId={state.id} code={state.code} />
        </div>
      </div>

      <footer className="text-center text-white/50">Esperando jugadores…</footer>
    </div>
  );
}