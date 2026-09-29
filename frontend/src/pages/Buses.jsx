import { useEffect, useState, useCallback } from 'react'
import Topbar from '../components/Topbar'
import { Loading, ErrorState } from '../components/Common'
import api from '../services/api'

export default function Buses() {
  const [buses, setBuses] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const { data } = await api.getBuses()
      setBuses(data)
      const results = await Promise.all(data.map((b) => api.getBus(b.bus_id).catch(() => null)))
      const issuesData = await api.getIssues()
      const c = {}
      issuesData.data.forEach((i) => { c[i.bus_id] = (c[i.bus_id] || 0) + 1 })
      setCounts(c)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const timeAgo = (iso) => {
    if (!iso) return '—'
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins} min ago`
    return `${Math.round(mins / 60)} hr ago`
  }

  return (
    <div>
      <Topbar title="Buses" onDataChanged={load} />
      <div className="p-6">
        {loading && <Loading />}
        {error && <ErrorState label="Couldn't load bus fleet data." />}

        {!loading && !error && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-border bg-white/5">
                  <th className="p-3">Bus ID</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last GPS</th>
                  <th className="p-3">Last Seen</th>
                  <th className="p-3">Issues Detected</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus) => (
                  <tr key={bus.bus_id} className="border-b border-border/50 hover:bg-white/5">
                    <td className="p-3 font-medium text-white">{bus.bus_id}</td>
                    <td className="p-3 text-slate-400">{bus.route_name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs border ${bus.status === 'ACTIVE' ? 'bg-low/20 text-low border-low/40' : 'bg-slate-500/20 text-slate-400 border-slate-500/40'}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{bus.last_latitude?.toFixed(4)}, {bus.last_longitude?.toFixed(4)}</td>
                    <td className="p-3 text-slate-400">{timeAgo(bus.last_seen)}</td>
                    <td className="p-3 text-slate-400">{counts[bus.bus_id] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
