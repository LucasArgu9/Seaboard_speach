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
  refetch: () => void;
}

/**
 * Fuente de verdad = GET /api/session/[id]. El canal Realtime solo emite un
 * "bump" que dispara un refetch inmediato. Además hay polling de respaldo para
 * cubrir reconexiones y refrescos.
 */
export function useGameState(sessionId: string, opts: Options = {}): GameStateHook {
  const pollMs = opts.pollMs ?? 1400;
  const playerId = opts.playerId ?? null;
  const [state, setState] = useState<PublicState | null>(null);
  const [connected, setConnected] = useState(false);
  const [offset, setOffset] = useState(0);
  const inflight = useRef(false);
  const alive = useRef(true);

  const refetch = useCallback(() => {
    if (inflight.current) return;
    inflight.current = true;
    fetch(`/api/session/${sessionId}${playerId ? `?playerId=${playerId}` : ""}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PublicState | null) => {
        if (!alive.current || !data) return;
        setOffset(data.serverNow - Date.now());
        setState((prev) => (prev && prev.rev > data.rev ? prev : data));
      })
      .catch(() => {})
      .finally(() => {
        inflight.current = false;
      });
  }, [sessionId, playerId]);

  useEffect(() => {
    alive.current = true;
    refetch();
    const id = setInterval(refetch, pollMs);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [refetch, pollMs]);

  useEffect(() => {
    const client = supabaseBrowser();
    const channel = client
      .channel(sessionChannelName(sessionId), { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "bump" }, () => refetch())
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });
    return () => {
      client.removeChannel(channel);
    };
  }, [sessionId, refetch]);

  return { state, connected, clockOffsetMs: offset, refetch };
}
