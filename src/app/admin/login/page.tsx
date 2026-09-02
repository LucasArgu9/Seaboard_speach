"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) router.replace("/admin");
    else setError("Contraseña incorrecta");
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-mist p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <h1 className="text-2xl font-black text-navy-800">Panel · Desafío Seaboard</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="sb-focus w-full rounded-xl border border-cloud p-4 text-lg"
        />
        {error && <p className="text-sm font-semibold text-coral">{error}</p>}
        <button
          disabled={busy || !password}
          className="sb-focus w-full rounded-xl bg-navy-600 p-4 text-lg font-bold text-white disabled:opacity-40"
        >
          {busy ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
