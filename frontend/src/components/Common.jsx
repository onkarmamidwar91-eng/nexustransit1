export function StatCard({ label, value, accent }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${accent || 'text-white'}`}>{value}</p>
    </div>
  )
}

export function Loading({ label = 'Loading...' }) {
  return <div className="text-slate-400 text-sm py-8 text-center">{label}</div>
}

export function EmptyState({ label = 'No data yet.' }) {
  return <div className="text-slate-500 text-sm py-8 text-center border border-dashed border-border rounded-xl">{label}</div>
}

export function ErrorState({ label = 'Something went wrong loading this data.' }) {
  return <div className="text-red-400 text-sm py-8 text-center border border-red-500/30 bg-red-500/5 rounded-xl">{label}</div>
}
