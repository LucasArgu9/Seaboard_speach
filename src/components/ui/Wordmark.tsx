/** Wordmark simple de Seaboard (sin assets externos). */
export function Wordmark({ className = "", subtitle = false }: { className?: string; subtitle?: boolean }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 font-black tracking-tight">
        <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
        <span>SEABOARD</span>
      </div>
      {subtitle && (
        <div className="text-[0.6em] font-semibold uppercase tracking-[0.2em] opacity-70">
          Energías Renovables y Alimentos
        </div>
      )}
    </div>
  );
}
