"use client";
import { useEffect, useState } from "react";

interface Props {
  /** ms epoch (reloj servidor) en que arrancó la pregunta. */
  startedAt: number;
  durationMs: number;
  /** serverNow - Date.now() del cliente. */
  clockOffsetMs?: number;
  size?: number;
  onExpire?: () => void;
}

/** Anillo que se vacía + segundos restantes. Se sincroniza con el reloj del server. */
export function TimerRing({ startedAt, durationMs, clockOffsetMs = 0, size = 220, onExpire }: Props) {
  const [now, setNow] = useState(() => Date.now() + clockOffsetMs);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setNow(Date.now() + clockOffsetMs);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [clockOffsetMs]);

  const elapsed = Math.max(0, now - startedAt);
  const remainingMs = Math.max(0, durationMs - elapsed);
  const frac = Math.max(0, Math.min(1, remainingMs / durationMs));
  const seconds = Math.ceil(remainingMs / 1000);

  useEffect(() => {
    if (remainingMs <= 0) onExpire?.();
  }, [remainingMs <= 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = frac > 0.5 ? "#33A457" : frac > 0.2 ? "#F2A83B" : "#E4632D";

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          style={{ transition: "stroke 0.3s linear" }}
        />
      </svg>
      <span
        className="absolute font-black tabular-nums text-white"
        style={{ fontSize: size * 0.34 }}
      >
        {seconds}
      </span>
    </div>
  );
}
