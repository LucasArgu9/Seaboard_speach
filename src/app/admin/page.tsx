import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/session";
import {
  computeAdminStats,
  type Breakdown,
  type QuestionStat,
  type ParticipantRow,
} from "@/lib/admin/stats";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const s = await computeAdminStats();

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black text-navy-800">Desafío Seaboard · Panel</h1>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/admin/export.csv"
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white"
          >
            ⬇ Participantes (CSV)
          </a>
          <a
            href="/api/admin/export-respuestas.csv"
            className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-bold text-white"
          >
            ⬇ Respuestas (CSV)
          </a>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Participantes" value={s.totalParticipants} />
        <Kpi label="Salas creadas" value={s.totalSessions} />
        <Kpi label="Rondas jugadas" value={s.totalRounds} />
        <Kpi label="Respuestas" value={s.totalAnswers} />
        <Kpi label="Prom. aciertos" value={s.avgCorrectPerPlayer.toFixed(1)} sub="de 5" />
        <Kpi label="Universidades" value={s.universities.length} />
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <BreakdownCard title="Por universidad" rows={s.universities} />
        <BreakdownCard title="Por carrera" rows={s.careers} />
        <BreakdownCard title="Por año cursado" rows={s.years} />
      </div>

      <ParticipantsTable rows={s.participants} />

      <div className="grid gap-6 md:grid-cols-2">
        <QuestionCard title="Preguntas más acertadas" rows={s.easiestQuestions} good />
        <QuestionCard title="Preguntas más difíciles" rows={s.hardestQuestions} />
      </div>

      <section className="rounded-2xl border border-cloud bg-white p-5">
        <h2 className="mb-3 text-lg font-black text-navy-800">Ranking general (top 10)</h2>
        <ol className="space-y-1">
          {s.generalRanking.map((r, i) => (
            <li key={i} className="flex justify-between border-b border-mist py-1 text-sm">
              <span>
                {i + 1}. {r.firstName}
              </span>
              <span className="tabular-nums text-slate">
                {r.score.toLocaleString("es-AR")} pts · {r.correctCount} ✓
              </span>
            </li>
          ))}
          {s.generalRanking.length === 0 && <li className="text-sm text-slate">Sin datos todavía.</li>}
        </ol>
      </section>

      <div className="pt-4">
        <LogoutButton />
      </div>
    </main>
  );
}

function Kpi({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-cloud bg-white p-4">
      <p className="text-xs font-semibold text-slate">{label}</p>
      <p className="text-3xl font-black text-navy-800">{value}</p>
      {sub && <p className="text-xs text-slate">{sub}</p>}
    </div>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: Breakdown[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="rounded-2xl border border-cloud bg-white p-5">
      <h2 className="mb-3 text-lg font-black text-navy-800">{title}</h2>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.label} className="text-sm">
            <div className="flex justify-between gap-2">
              <span className="truncate">{r.label}</span>
              <span className="shrink-0 font-bold tabular-nums">{r.count}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-mist">
              <div
                className="h-2 rounded-full bg-navy-500"
                style={{ width: `${(r.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
        {rows.length === 0 && <li className="text-sm text-slate">Sin datos todavía.</li>}
      </ul>
    </section>
  );
}

function ParticipantsTable({ rows }: { rows: ParticipantRow[] }) {
  return (
    <section className="rounded-2xl border border-cloud bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-black text-navy-800">Participantes ({rows.length})</h2>
        <a href="/api/admin/export.csv" className="text-sm font-semibold text-green-700 underline">
          Descargar todo
        </a>
      </div>
      <div className="max-h-[26rem] overflow-auto rounded-xl border border-mist">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="sticky top-0 bg-mist text-left text-xs uppercase text-slate">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">Universidad</th>
              <th className="p-2">Carrera</th>
              <th className="p-2">Año</th>
              <th className="p-2">Contacto</th>
              <th className="p-2">Sala</th>
              <th className="p-2 text-right">Puntaje</th>
              <th className="p-2 text-right">✓</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={i} className="border-t border-mist">
                <td className="p-2 font-semibold">
                  {p.firstName} {p.lastName}
                </td>
                <td className="p-2">{p.university}</td>
                <td className="p-2">{p.career}</td>
                <td className="p-2">{p.year}</td>
                <td className="p-2">{p.contact || "—"}</td>
                <td className="p-2 tabular-nums">{p.sessionCode}</td>
                <td className="p-2 text-right font-bold tabular-nums">
                  {p.score.toLocaleString("es-AR")}
                </td>
                <td className="p-2 text-right tabular-nums">{p.correctCount}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="p-3 text-center text-slate">
                  Sin participantes todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function QuestionCard({
  title,
  rows,
  good,
}: {
  title: string;
  rows: QuestionStat[];
  good?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-cloud bg-white p-5">
      <h2 className="mb-3 text-lg font-black text-navy-800">{title}</h2>
      <ul className="space-y-2">
        {rows.map((q) => (
          <li key={q.id} className="text-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="flex-1">{q.prompt}</span>
              <span
                className={`shrink-0 font-black tabular-nums ${good ? "text-green-600" : "text-coral"}`}
              >
                {Math.round(q.correctRate * 100)}%
              </span>
            </div>
            <p className="text-xs text-slate">
              {q.category} · {q.correct}/{q.asked} aciertos
            </p>
          </li>
        ))}
        {rows.length === 0 && <li className="text-sm text-slate">Sin datos todavía.</li>}
      </ul>
    </section>
  );
}
