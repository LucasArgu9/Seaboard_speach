"use client";
import { AnimatePresence, motion } from "framer-motion";
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
      <AnimatePresence mode="popLayout">
        <motion.div
          key={label}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="font-black text-white drop-shadow-[0_8px_30px_rgba(51,164,87,0.5)]"
          style={{ fontSize: "clamp(6rem, 22vw, 16rem)" }}
        >
          {label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
