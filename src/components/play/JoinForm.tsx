"use client";
import { useState } from "react";
import { UNSA_CAREERS, CAREER_OTHER, STUDY_YEARS } from "@/lib/careers";
import { Wordmark } from "@/components/ui/Wordmark";

export interface JoinValues {
  firstName: string;
  lastName: string;
  career: string;
  careerOther: string;
  year: string;
  contact: string;
}

const EMPTY: JoinValues = {
  firstName: "",
  lastName: "",
  career: "",
  careerOther: "",
  year: "",
  contact: "",
};

export function JoinForm({
  onSubmit,
  error,
  busy,
}: {
  onSubmit: (v: JoinValues) => void;
  error: string | null;
  busy: boolean;
}) {
  const [v, setV] = useState<JoinValues>(EMPTY);
  const isOther = v.career === CAREER_OTHER;

  const valid =
    v.firstName.trim() &&
    v.lastName.trim() &&
    v.career &&
    v.year &&
    v.contact.trim().length >= 5 &&
    (!isOther || v.careerOther.trim().length > 0);

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
            <optgroup label="UNSA">
              {UNSA_CAREERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
            <option value={CAREER_OTHER}>{CAREER_OTHER}</option>
          </select>
        </label>

        {isOther && (
          <Input
            label="¿Cuál? Escribí tu carrera"
            value={v.careerOther}
            maxLength={60}
            onChange={(x) => setV({ ...v, careerOther: x })}
          />
        )}

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

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate">Correo o teléfono</span>
          <input
            value={v.contact}
            onChange={(e) => setV({ ...v, contact: e.target.value })}
            maxLength={80}
            autoComplete="off"
            inputMode="text"
            placeholder="ej. nombre@mail.com  ·  3878 000000"
            className="sb-focus w-full rounded-xl border border-cloud bg-white p-4 text-lg"
          />
          <span className="mt-1 block text-xs text-slate">
            Para que Seaboard pueda contactarte por oportunidades laborales.
          </span>
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
  maxLength = 40,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        autoComplete="off"
        className="sb-focus w-full rounded-xl border border-cloud bg-white p-4 text-lg"
      />
    </label>
  );
}
