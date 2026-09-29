import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/Topbar'
import { Loading, ErrorState, EmptyState } from '../components/Common'
import { PriorityBadge, StatusBadge } from '../components/Badges'
import api from '../services/api'

const ISSUE_TYPES = ['POTHOLE', 'GARBAGE', 'WATERLOGGING', 'OBSTRUCTION', 'STREETLIGHT', 'OTHER']
const STATUSES = ['DETECTED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function Issues() {
  const [issues, setIssues] = useState([])
  const [filters, setFilters] = useState({ status: '', issue_type: '', priority: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      const { data } = await api.getIssues(params)
      setIssues(data)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const selectClass = "bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-slate-200"

  return (
    <div>
      <Topbar title="Issues" onDataChanged={load} />
      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <select className={selectClass} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select className={selectClass} value={filters.issue_type} onChange={(e) => setFilters({ ...filters, issue_type: e.target.value })}>
            <option value="">All types</option>
            {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className={selectClass} value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {loading && <Loading />}
        {error && <ErrorState label="Couldn't load issues from the backend." />}
        {!loading && !error && issues.length === 0 && <EmptyState label="No issues match these filters." />}

        {!loading && !error && issues.length > 0 && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-border bg-white/5">
                  <th className="p-3">ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Bus</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Observations</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} className="border-b border-border/50 hover:bg-white/5">
                    <td className="p-3">
                      <Link to={`/issues/${issue.id}`} className="text-accent hover:underline">
                        NX-{String(issue.id).padStart(5, '0')}
                      </Link>
                    </td>
                    <td className="p-3">{issue.issue_type}</td>
                    <td className="p-3 text-slate-400">{issue.bus_id}</td>
                    <td className="p-3 text-slate-400">{Math.round(issue.confidence * 100)}%</td>
                    <td className="p-3"><PriorityBadge priority={issue.priority} /></td>
                    <td className="p-3"><StatusBadge status={issue.status} /></td>
                    <td className="p-3 text-slate-400">{issue.observation_count}</td>
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
