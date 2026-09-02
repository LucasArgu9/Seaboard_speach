"use client";
import { useEffect, useState } from "react";

/** 3 · 2 · 1 · ¡YA! Puramente visual; la pantalla decide cuándo avanzar. */
export function Countdown321({ from = 3 }: { from?: number }) {
  const [n, setN] = useState(from);

  useEffect(() => {
    if (n <= 0) return;
    const t = setTimeout(() => setN((v) => v - 1), 900);
    return () => clearTimeout(t);
  }, [n]);

  const label = n > 0 ? String(n) : "¡YA!";

  return (
    <div className="grid place-items-center">
      {/* key re-monta el nodo en cada número => se re-dispara la animación CSS */}
      <div
        key={label}
        className="sb-anim-count font-black text-white drop-shadow-[0_8px_30px_rgba(51,164,87,0.5)]"
        style={{ fontSize: "clamp(6rem, 22vw, 16rem)" }}
      >
        {label}
      </div>
    </div>
  );
}
