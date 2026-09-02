"use client";
import type { PublicState } from "@/lib/game/types";
import { MIN_PLAYERS, MAX_PLAYERS } from "@/lib/game/config";
import { seatColor, initials } from "@/lib/ui";
import { Wordmark } from "@/components/ui/Wordmark";
import { QrPanel } from "./QrPanel";

export function StandLobby({
  state,
  onStart,
  busy,
}: {
  state: PublicState;
  onStart: () => void;
  busy: boolean;
}) {
  const count = state.players.length;
  const canStart = count >= MIN_PLAYERS && count <= MAX_PLAYERS;

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-6 p-10">
      <header className="flex items-center justify-between">
        <Wordmark className="text-2xl" subtitle />
        <span className="text-2xl font-black tabular-nums">
          {count} <span className="text-white/50">/ {MAX_PLAYERS}</span>
        </span>
      </header>

      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="justify-self-center">
          <QrPanel sessionId={state.id} code={state.code} />
          <p className="mt-3 text-center text-white/70">Todavía te podés sumar</p>
        </div>

        <div className="flex flex-col">
          <h2 className="mb-4 text-3xl font-black">Jugadores en la sala</h2>
          <ul className="sb-scroll grid max-h-[46vh] gap-3 overflow-y-auto pr-2 sm:grid-cols-2">
            {state.players.map((p) => (
              <li
                key={p.id}
                className="sb-anim-pop flex items-center gap-3 rounded-2xl bg-white/10 p-3"
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-black text-white"
                  style={{ background: seatColor(p.seat) }}
                >
                  {initials(p.firstName)}
                </span>
                <span className="truncate text-lg font-semibold">{p.firstName}</span>
                <span className="ml-auto text-green-300">✓</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="flex items-center justify-center">
        <button
          onClick={onStart}
          disabled={!canStart || busy}
          className="sb-focus rounded-2xl bg-green-500 px-14 py-5 text-2xl font-black text-white shadow-xl transition enabled:hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Iniciando…" : canStart ? "Iniciar ronda" : `Faltan jugadores (mín. ${MIN_PLAYERS})`}
        </button>
      </footer>
    </div>
  );
}