"use client";
import { useCallback, useEffect, useState } from "react";

export interface StoredPlayer {
  playerId: string;
  firstName: string;
}

/** Persiste el jugador para sobrevivir a un refresh del teléfono. */
export function useStoredPlayer(sessionId: string) {
  const key = `desafio:player:${sessionId}`;
  const [player, setPlayer] = useState<StoredPlayer | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Lectura de localStorage en el montaje del cliente (evita mismatch de
    // hidratación). El flag `ready` gatea el render hasta tener el valor.
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setPlayer(JSON.parse(raw) as StoredPlayer);
    } catch {
      /* storage bloqueado: se juega sin persistencia */
    }
    setReady(true);
  }, [key]);

  const save = useCallback(
    (p: StoredPlayer) => {
      setPlayer(p);
      try {
        localStorage.setItem(key, JSON.stringify(p));
      } catch {
        /* noop */
      }
    },
    [key],
  );

  const clear = useCallback(() => {
    setPlayer(null);
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  }, [key]);

  return { player, ready, save, clear };
}
