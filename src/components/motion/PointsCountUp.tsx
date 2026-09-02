"use client";
import { useEffect, useState } from "react";

/** Anima un entero de 0 (o `from`) a `value` en `durationMs`. */
export function PointsCountUp({
  value,
  from = 0,
  durationMs = 900,
  prefix = "",
  className,
}: {
  value: number;
  from?: number;
  durationMs?: number;
  prefix?: string;
  className?: string;
}) {
  const [n, setN] = useState(from);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(from + (value - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, from, durationMs]);

  return (
    <span className={className}>
      {prefix}
      {n.toLocaleString("es-AR")}
    </span>
  );
}
