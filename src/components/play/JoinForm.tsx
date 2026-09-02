"use client";
import { useState } from "react";
import { CAREERS, STUDY_YEARS } from "@/lib/careers";
import { Wordmark } from "@/components/ui/Wordmark";

export interface JoinValues {
  firstName: string;
  lastName: string;
  career: string;
  year: string;
}

export function JoinForm({
  onSubmit,
  error,
  busy,
}: {
  onSubmit: (v: JoinValues) => void;
  error: string | null;
  busy: boolean;
}) {
  const [v, setV] = useState<JoinValues>({ firstName: "", lastName: "", career: "", year: "" });
  const valid = v.firstName.trim() && v.lastName.trim() && v.career && v.year;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-5 p-6">
      <div className="text-center">
        <Wordmark className="justify-center text-xl text-navy-700" />
        <h1 className="mt-3 text-3xl font-black text-navy-800">DESAFÍO SEABOARD</h1>
        <p className="text-slate">¿Cuánto aprendiste sobre nosotros?</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid && !busy) onSubmit(v);
        }}
        className="space-y-3"
      >
        <Input label="Nombre" value={v.firstName} onChange={(x) => setV({ ...v, firstName: x })} />
        <Input label="Apellido" value={v.lastName} onChange={(x) => setV({ ...v, lastName: x })} />

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate">Carrera</span>
          <select
            value={v.career}
            onChange={(e) => setV({ ...v, career: e.target.value })}
            className="sb-focus w-full rounded-xl border border-cloud bg-white p-4 text-lg"
          >
            <option value="">Elegí tu carrera…</option>
            {CAREERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate">Año cursado actual</span>
          <select
            value={v.year}
            onChange={(e) => setV({ ...v, year: e.target.value })}
            className="sb-focus w-full rounded-xl border border-cloud bg-white p-4 text-lg"
          >
            <option value="">Elegí el año…</option>
            {STUDY_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p className="rounded-xl bg-coral/10 p-3 text-center text-sm font-semibold text-coral">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!valid || busy}
          className="sb-focus w-full rounded-2xl bg-green-500 p-5 text-xl font-black text-white transition enabled:active:scale-[0.98] disabled:opacity-40"
        >
          {busy ? "Entrando…" : "Unirme al desafío"}
        </button>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={40}
        autoComplete="off"
        className="sb-focus w-full rounded-xl border border-cloud bg-white p-4 text-lg"
      />
    </label>
  );
}
