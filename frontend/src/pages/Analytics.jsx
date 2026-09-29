import { useEffect, useState, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import Topbar from '../components/Topbar'
import { Loading, ErrorState } from '../components/Common'
import api from '../services/api'

const COLORS = ['#3b82f6', '#f97316', '#eab308', '#22c55e', '#a855f7', '#ef4444']

function toChartArray(obj) {
  return Object.entries(obj || {}).map(([name, value]) => ({ name, value }))
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const { data } = await api.getAnalytics()
      setData(data)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <Topbar title="Analytics" onDataChanged={load} />
      <div className="p-6 space-y-6">
        {loading && <Loading />}
        {error && <ErrorState label="Couldn't load analytics." />}

        {data && !error && (
          <>
            <p className="text-xs text-slate-500">{data.note}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5">
                <h4 className="text-sm font-semibold text-slate-200 mb-4">Issues by Type</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={toChartArray(data.issues_by_type)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5">
                <h4 className="text-sm font-semibold text-slate-200 mb-4">Issues by Priority</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={toChartArray(data.issues_by_priority)} dataKey="value" nameKey="name" outerRadius={90} label>
                      {toChartArray(data.issues_by_priority).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5">
                <h4 className="text-sm font-semibold text-slate-200 mb-4">Issues by Route</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={toChartArray(data.issues_by_route)} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937' }} />
                    <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5">
                <h4 className="text-sm font-semibold text-slate-200 mb-4">Issues Detected Per Day</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.issues_per_day}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937' }} />
                    <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5 md:col-span-2">
                <h4 className="text-sm font-semibold text-slate-200 mb-4">Resolved vs Unresolved</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      { name: 'Resolved', value: data.resolved_vs_unresolved.resolved },
                      { name: 'Unresolved', value: data.resolved_vs_unresolved.unresolved },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937' }} />
                    <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
