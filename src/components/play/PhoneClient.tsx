"use client";
import { useCallback, useMemo, useState } from "react";
import { useGameState } from "@/lib/realtime/useGameState";
import { OPTION_LETTERS, OPTION_CLASS, medal } from "@/lib/ui";
import { useStoredPlayer } from "./useStoredPlayer";
import { JoinForm, type JoinValues } from "./JoinForm";

export function PhoneClient({ sessionId }: { sessionId: string }) {
  const { player, ready, save, clear } = useStoredPlayer(sessionId);
  const { state } = useGameState(sessionId, { pollMs: 1500, playerId: player?.playerId });

  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [submittedIndex, setSubmittedIndex] = useState<number>(-1);
  const [submitting, setSubmitting] = useState(false);

  const join = useCallback(
    async (v: JoinValues) => {
      setJoining(true);
      setJoinError(null);
      try {
        const res = await fetch(`/api/session/${sessionId}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(v),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setJoinError(
            body?.error === "full"
              ? "La sala está llena (máx. jugadores). Esperá a la próxima ronda."
              : body?.message ?? "No se pudo entrar. Probá de nuevo.",
          );
          return;
        }
        save({ playerId: body.playerId, firstName: v.firstName });
      } catch {
        setJoinError("Sin conexión. Revisá el wifi e intentá otra vez.");
      } finally {
        setJoining(false);
      }
    },
    [sessionId, save],
  );

  const answer = useCallback(
    async (optionId: string) => {
      if (!player || !state?.question || submitting) return;
      setSubmitting(true);
      setSubmittedIndex(state.currentQuestionIndex);
      try {
        await fetch("/api/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            playerId: player.playerId,
            questionId: state.question.id,
            optionId,
          }),
        });
      } catch {
        /* el servidor califica igual como timeout si no llegó */
      } finally {
        setSubmitting(false);
      }
    },
    [player, state, sessionId, submitting],
  );

  // `submittedIndex` solo cuenta si coincide con la pregunta en curso; cuando
  // la ronda avanza, el índice cambia y el flag deja de aplicar solo.
  const phase = useMemo(() => {
    if (!player) return "JOIN" as const;
    if (!state) return "WAITING" as const;
    switch (state.status) {
      case "WAITING":
      case "LOBBY":
      case "COUNTDOWN":
        return "WAITING" as const;
      case "QUESTION":
        return state.you?.answeredCurrent || submittedIndex === state.currentQuestionIndex
          ? ("ANSWERED" as const)
          : ("ANSWERING" as const);
      case "ANSWER_REVEAL":
      case "SCORE_UPDATE":
        return "RESULT" as const;
      case "FINAL_RANKING":
        return "FINAL" as const;
    }
  }, [player, state, submittedIndex]);

  if (!ready) return <Screen tone="light" />;
  if (phase === "JOIN") return <JoinForm onSubmit={join} error={joinError} busy={joining} />;

  return (
    <div key={phase} className="min-h-dvh">
        {phase === "WAITING" && <Waiting name={player!.firstName} status={state?.status} />}
        {phase === "ANSWERING" && state?.question && (
          <Answering
            index={state.currentQuestionIndex}
            total={state.totalQuestions}
            options={state.question.options}
            disabled={submitting}
            onPick={answer}
          />
        )}
        {phase === "ANSWERED" && <Answered />}
        {phase === "RESULT" && state && (
          <RoundResult
            points={state.reveal?.perPlayer.find((p) => p.playerId === player!.playerId)?.points ?? 0}
            correct={
              state.reveal?.perPlayer.find((p) => p.playerId === player!.playerId)?.isCorrect ?? false
            }
          />
        )}
        {phase === "FINAL" && state && (
          <FinalResult
            entry={state.finalRanking?.find((r) => r.playerId === player!.playerId) ?? null}
            onLeave={clear}
          />
        )}
    </div>
  );
}

/* --------------------------------------------------------------- pantallas */

function Screen({ tone, children }: { tone: "light" | "dark"; children?: React.ReactNode }) {
  return (
    <div
      className={`grid min-h-dvh place-items-center p-6 text-center ${
        tone === "dark" ? "bg-navy-900 text-white" : "bg-mist text-ink"
      }`}
    >
      {children}
    </div>
  );
}

function Waiting({ name, status }: { name: string; status?: string }) {
  return (
    <Screen tone="dark">
      <div className="space-y-3">
        <p className="text-2xl">Hola, <span className="font-black text-green-300">{name}</span> 👋</p>
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-green-400" />
        <p className="text-lg text-white/70">
          {status === "COUNTDOWN" ? "¡Ya arranca!" : "Mirá la pantalla grande. Empezamos en breve…"}
        </p>
      </div>
    </Screen>
  );
}

function Answering({
  index,
  total,
  options,
  disabled,
  onPick,
}: {
  index: number;
  total: number;
  options: { id: string; text: string }[];
  disabled: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col gap-3 bg-navy-900 p-4">
      <p className="text-center text-sm font-bold uppercase tracking-widest text-white/60">
        Pregunta {index + 1} de {total} · elegí tu respuesta
      </p>
      <div className="grid flex-1 grid-rows-4 gap-3">
        {options.map((opt, i) => (
          <button
            key={opt.id}
            disabled={disabled}
            onClick={() => onPick(opt.id)}
            className={`${OPTION_CLASS[i]} sb-focus flex items-center gap-4 rounded-2xl p-5 text-left text-white transition active:scale-[0.98] disabled:opacity-60`}
            style={{ background: "var(--opt)" }}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-black/20 text-2xl font-black">
              {OPTION_LETTERS[i]}
            </span>
            <span className="text-lg font-bold leading-tight">{opt.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Answered() {
  return (
    <Screen tone="dark">
      <div className="sb-anim-pop space-y-3">
        <p className="text-6xl">✓</p>
        <p className="text-2xl font-black text-green-300">Respuesta registrada</p>
        <p className="text-white/60">No se puede cambiar. Mirá la pantalla grande.</p>
      </div>
    </Screen>
  );
}

function RoundResult({ points, correct }: { points: number; correct: boolean }) {
  return (
    <Screen tone="dark">
      <div className="sb-anim-pop space-y-2">
        <p className="text-7xl">{correct ? "✅" : "❌"}</p>
        <p className={`text-3xl font-black ${correct ? "text-green-300" : "text-white/70"}`}>
          {correct ? "¡Correcto!" : "Esta vez no"}
        </p>
        <p className="text-5xl font-black tabular-nums">+{points}</p>
        <p className="text-white/60">Seguí en la pantalla grande…</p>
      </div>
    </Screen>
  );
}

function FinalResult({
  entry,
  onLeave,
}: {
  entry: { rank: number; score: number; correctCount: number; sharedPosition: boolean } | null;
  onLeave: () => void;
}) {
  return (
    <Screen tone="dark">
      <div className="space-y-4">
        <p className="text-xl font-bold uppercase tracking-[0.3em] text-green-300">Resultado</p>
        {entry ? (
          <>
            <p className="text-7xl font-black">
              {entry.sharedPosition ? `${entry.rank}°=` : medal(entry.rank)}
            </p>
            <p className="text-4xl font-black tabular-nums text-green-300">
              {entry.score.toLocaleString("es-AR")} pts
            </p>
            <p className="text-white/60">{entry.correctCount} respuestas correctas</p>
          </>
        ) : (
          <p className="text-xl text-white/70">¡Gracias por jugar!</p>
        )}
        <button
          onClick={onLeave}
          className="sb-focus mt-4 rounded-2xl bg-white/15 px-8 py-3 text-lg font-bold"
        >
          Salir
        </button>
      </div>
    </Screen>
  );
}
