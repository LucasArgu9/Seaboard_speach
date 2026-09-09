"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabaseBrowser, sessionChannelName } from "@/lib/supabase/browser";
import type { PublicState } from "@/lib/game/types";

interface Options {
  /** Polling de respaldo. La pantalla usa 1200 ms; el teléfono 1500 ms. */
  pollMs?: number;
  /** Si se pasa, el estado incluye el campo `you`. */
  playerId?: string | null;
}

export interface GameStateHook {
  state: PublicState | null;
  connected: boolean;
  /** ms a sumar a Date.now() del cliente para estimar el reloj del servidor. */
  clockOffsetMs: number;
  /** true si el GET devolvió 404: la sesión ya no existe (p. ej. se vació la base). */
  notFound: boolean;
  refetch: () => void;
}

/**
 * Fuente de verdad = GET /api/session/[id]. El canal Realtime solo emite un
 * "bump" que dispara un refetch inmediato. Además hay polling de respaldo para
 * cubrir reconexiones y refrescos.
 *
 * Los efectos dependen SOLO de primitivos (sessionId / playerId / pollMs) y
 * `refetch` es estable de por vida: así ni el polling ni los re-render tiran
 * abajo el intervalo ni la suscripción.
 */
export function useGameState(sessionId: string, opts: Options = {}): GameStateHook {
  const pollMs = opts.pollMs ?? 1400;
  const playerId = opts.playerId ?? null;

  const [state, setState] = useState<PublicState | null>(null);
  const [connected, setConnected] = useState(false);
  const [offset, setOffset] = useState(0);
  const [notFound, setNotFound] = useState(false);

  const inflight = useRef(false);
  /** Última función de fetch (capturada por el efecto de polling). */
  const runRef = useRef<() => void>(() => {});
  const refetch = useCallback(() => runRef.current(), []);

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      if (inflight.current) return;
      inflight.current = true;
      const url = `/api/session/${sessionId}${playerId ? `?playerId=${encodeURIComponent(playerId)}` : ""}`;
      fetch(url, { cache: "no-store" })
        .then((r) => {
          if (r.status === 404 && !cancelled) setNotFound(true);
          return r.ok ? (r.json() as Promise<PublicState>) : null;
        })
        .then((data) => {
          if (cancelled || !data) return;
          setNotFound(false);
          setOffset(data.serverNow - Date.now());
          setState((prev) => (prev && prev.rev > data.rev ? prev : data));
        })
        .catch(() => {})
        .finally(() => {
          inflight.current = false;
        });
    };

    runRef.current = run;
    run();
    const id = setInterval(run, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [sessionId, playerId, pollMs]);

  useEffect(() => {
    const client = supabaseBrowser();
    const channel = client
      .channel(sessionChannelName(sessionId), { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "bump" }, () => runRef.current())
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));
    return () => {
      client.removeChannel(channel);
    };
  }, [sessionId]);

  return { state, connected, clockOffsetMs: offset, notFound, refetch };
}
