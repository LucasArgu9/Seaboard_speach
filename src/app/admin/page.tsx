import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/session";
import { computeAdminStats, type Breakdown, type QuestionStat } from "@/lib/admin/stats";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const s = await computeAdminStats();

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black text-navy-800">Desafío Seaboard · Panel</h1>
        <a
          href="/api/admin/export.csv"
          className="rounded-xl bg-green-600 px-4 py-2 font-bold text-white"
        >
          Exportar CSV
        </a>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Participantes" value={s.totalParticipants} />
        <Kpi label="Rondas jugadas" value={s.totalRounds} />
        <Kpi
          label="Prom. respuestas correctas"
          value={s.avgCorrectPerPlayer.toFixed(1)}
          sub="por jugador (de 5)"
        />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <BreakdownCard title="Carreras participantes" rows={s.careers} />
        <BreakdownCard title="Distribución por año cursado" rows={s.years} />
      </div>

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
    <div className="rounded-2xl border border-cloud bg-white p-5">
      <p className="text-sm font-semibold text-slate">{label}</p>
      <p className="text-4xl font-black text-navy-800">{value}</p>
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
            <div className="flex justify-between">
              <span>{r.label}</span>
              <span className="font-bold tabular-nums">{r.count}</span>
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

