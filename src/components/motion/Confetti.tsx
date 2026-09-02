"use client";
import { useEffect, useRef } from "react";

const COLORS = ["#2E63BD", "#33A457", "#F2A83B", "#E4632D", "#FFFFFF", "#8FD8A6"];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
}

/** Confeti de celebración en canvas (sin dependencias). Se detiene solo. */
export function Confetti({ durationMs = 6000 }: { durationMs?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = (canvas.width = window.innerWidth * dpr);
    let h = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const count = Math.min(220, Math.round(window.innerWidth / 6));
    const pieces: Piece[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: -Math.random() * h * 0.4,
      vx: (Math.random() - 0.5) * 1.6 * dpr,
      vy: (2 + Math.random() * 3.5) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      size: (5 + Math.random() * 7) * dpr,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    }));

    const start = performance.now();
    let raf = 0;

    const onResize = () => {
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
    };
    window.addEventListener("resize", onResize);

    const tick = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, w, h);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02 * dpr;
        p.rot += p.vr;
        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = elapsed > durationMs - 1200 ? Math.max(0, (durationMs - elapsed) / 1200) : 1;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (elapsed < durationMs) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [durationMs]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  );
}
