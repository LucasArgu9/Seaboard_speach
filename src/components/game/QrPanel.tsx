"use client";
import { QRCodeSVG } from "qrcode.react";
import { publicEnv } from "@/lib/env";

export function joinUrl(sessionId: string): string {
  // En la feria el teléfono debe poder alcanzar al host de la pantalla: usamos
  // el origin real del navegador y caemos al env solo en SSR.
  const base =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : publicEnv.appBaseUrl.replace(/\/$/, "");
  return `${base}/play/${sessionId}`;
}

export function QrPanel({ sessionId, code }: { sessionId: string; code: string }) {
  const url = joinUrl(sessionId);
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-ink shadow-2xl">
      <QRCodeSVG value={url} size={260} level="M" marginSize={2} />
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate">Sala</p>
        <p className="text-3xl font-black tracking-[0.3em] text-navy-700">{code}</p>
      </div>
      <p className="max-w-[260px] break-all text-center text-xs text-slate">{url}</p>
    </div>
  );
}
