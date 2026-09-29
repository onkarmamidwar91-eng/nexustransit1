import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/Topbar'
import { Loading, ErrorState, EmptyState } from '../components/Common'
import { PriorityBadge, StatusBadge } from '../components/Badges'
import api from '../services/api'

export default function Maintenance() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [assigned, inProgress] = await Promise.all([
        api.getIssues({ status: 'ASSIGNED' }),
        api.getIssues({ status: 'IN_PROGRESS' }),
      ])
      setIssues([...assigned.data, ...inProgress.data])
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const act = async (fn) => {
    try {
      await fn()
      load()
    } catch (e) {
      alert('You need to log in to update maintenance status.')
    }
  }

  return (
    <div>
      <Topbar title="Maintenance" onDataChanged={load} />
      <div className="p-6 space-y-4">
        {loading && <Loading />}
        {error && <ErrorState label="Couldn't load maintenance tickets." />}
        {!loading && !error && issues.length === 0 && <EmptyState label="No active maintenance tickets." />}

        {!loading && !error && issues.length > 0 && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-border bg-white/5">
                  <th className="p-3">Issue</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Assigned To</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} className="border-b border-border/50 hover:bg-white/5">
                    <td className="p-3">
                      <Link to={`/issues/${issue.id}`} className="text-accent hover:underline">
                        {issue.issue_type} · NX-{String(issue.id).padStart(5, '0')}
                      </Link>
                    </td>
                    <td className="p-3 text-slate-400">{issue.department || '—'}</td>
                    <td className="p-3 text-slate-400">{issue.assigned_to || '—'}</td>
                    <td className="p-3"><PriorityBadge priority={issue.priority} /></td>
                    <td className="p-3"><StatusBadge status={issue.status} /></td>
                    <td className="p-3">
                      {issue.status === 'ASSIGNED' && (
                        <button onClick={() => act(() => api.progressIssue(issue.id))} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium px-2 py-1 rounded-lg">MARK IN PROGRESS</button>
                      )}
                      {issue.status === 'IN_PROGRESS' && (
                        <button onClick={() => act(() => api.resolveIssue(issue.id))} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-2 py-1 rounded-lg">RESOLVE</button>
                      )}
                    </td>
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
