"use client";
import { useEffect, useState } from "react";
import { publicEnv } from "@/lib/env";
import { Wordmark } from "@/components/ui/Wordmark";

const STORAGE_KEY = "desafio:kiosk";

/**
 * Candado del stand: la primera vez que se abre la pantalla en un navegador se
 * pide la clave; una vez desbloqueado queda así en ese dispositivo (localStorage).
 * No aplica al teléfono (`/play/...`), que debe entrar libremente con el QR.
 */
export function KioskGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    // Lectura de localStorage en el montaje del cliente (patrón de hidratación).
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    } catch {
      /* storage bloqueado: se pedirá la clave cada vez */
    }
    setReady(true);
  }, []);

  if (!ready) return <div className="sb-stand-bg min-h-dvh" />;
  if (unlocked) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === publicEnv.kioskKey) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* noop */
      }
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  return (
    <main className="sb-stand-bg grid min-h-dvh place-items-center p-6 text-white">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl bg-white/10 p-8 text-center backdrop-blur"
      >
        <div className="mb-6 flex justify-center">
          <Wordmark height={40} />
        </div>
        <h1 className="text-2xl font-black">Desafío Seaboard</h1>
        <p className="mt-1 text-white/70">Ingresá la clave para habilitar esta pantalla.</p>
        <input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          className="sb-focus mt-5 w-full rounded-xl border border-white/20 bg-white/10 p-4 text-center text-lg text-white placeholder:text-white/40"
          placeholder="Clave"
        />
        {error && <p className="mt-2 text-sm font-semibold text-amber">Clave incorrecta</p>}
        <button
          type="submit"
          className="sb-focus mt-4 w-full rounded-xl bg-green-500 p-4 text-lg font-black text-white transition enabled:hover:bg-green-400"
        >
          Desbloquear
        </button>
        <p className="mt-4 text-xs text-white/40">Se pide una sola vez por dispositivo.</p>
      </form>
    </main>
  );
}
