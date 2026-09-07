"use client";
import { useState } from "react";
import {
  UNIVERSITIES,
  UNIVERSITY_OTHER,
  CAREERS_BY_UNIVERSITY,
  CAREER_OTHER,
  STUDY_YEARS,
} from "@/lib/careers";
import { Wordmark } from "@/components/ui/Wordmark";

export interface JoinValues {
  firstName: string;
  lastName: string;
  university: string;
  universityOther: string;
  career: string;
  careerOther: string;
  year: string;
  contact: string;
}

const EMPTY: JoinValues = {
  firstName: "",
  lastName: "",
  university: "",
  universityOther: "",
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

  const uniIsOther = v.university === UNIVERSITY_OTHER;
  const careerList = CAREERS_BY_UNIVERSITY[v.university] ?? [];
  const careerIsOther = v.career === CAREER_OTHER;

  const valid =
    v.firstName.trim() &&
    v.lastName.trim() &&
    v.university &&
    (!uniIsOther || v.universityOther.trim().length > 0) &&
    v.career.trim() &&
    (!careerIsOther || v.careerOther.trim().length > 0) &&
    v.year &&
    v.contact.trim().length >= 5;

  // Cambiar de universidad resetea la carrera (las listas son distintas).
  const setUniversity = (university: string) =>
    setV({ ...v, university, career: "", careerOther: "" });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-5 p-6">
      <div className="text-center">
        <div className="flex justify-center">
          <Wordmark height={54} />
        </div>
        <h1 className="mt-4 text-3xl font-black text-navy-800">DESAFÍO SEABOARD</h1>
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

        <Select
          label="Universidad"
          value={v.university}
          placeholder="Elegí tu universidad…"
          options={UNIVERSITIES}
          onChange={setUniversity}
        />

        {uniIsOther && (
          <Input
            label="¿Cuál universidad?"
            value={v.universityOther}
            maxLength={60}
            onChange={(x) => setV({ ...v, universityOther: x })}
          />
        )}

        {v.university && !uniIsOther && (
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate">Carrera</span>
            <select
              value={v.career}
              onChange={(e) => setV({ ...v, career: e.target.value, careerOther: "" })}
              className="sb-focus w-full rounded-xl border border-cloud bg-white p-4 text-lg"
            >
              <option value="">Elegí tu carrera…</option>
              <optgroup label={v.university}>
                {careerList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
              <option value={CAREER_OTHER}>{CAREER_OTHER}</option>
            </select>
          </label>
        )}

        {uniIsOther && (
          <Input
            label="Carrera"
            value={v.career}
            maxLength={80}
            onChange={(x) => setV({ ...v, career: x })}
          />
        )}

        {!uniIsOther && careerIsOther && (
          <Input
            label="¿Cuál? Escribí tu carrera"
            value={v.careerOther}
            maxLength={60}
            onChange={(x) => setV({ ...v, careerOther: x })}
          />
        )}

        <Select
          label="Año cursado actual"
          value={v.year}
          placeholder="Elegí el año…"
          options={STUDY_YEARS}
          onChange={(x) => setV({ ...v, year: x })}
        />

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

function Select({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sb-focus w-full rounded-xl border border-cloud bg-white p-4 text-lg"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
