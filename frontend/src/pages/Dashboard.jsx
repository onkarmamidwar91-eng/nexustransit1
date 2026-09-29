import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/Topbar'
import { StatCard, Loading, ErrorState } from '../components/Common'
import { PriorityBadge, StatusBadge } from '../components/Badges'
import api from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [statsRes, issuesRes] = await Promise.all([api.getStats(), api.getIssues()])
      setStats(statsRes.data)
      setRecent(issuesRes.data.slice(0, 6))
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <Topbar title="Dashboard" onDataChanged={load} />
      <div className="p-6 space-y-6">
        {loading && <Loading />}
        {error && <ErrorState label="Couldn't reach the backend API. Is it running on localhost:8000?" />}

        {stats && !error && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Total Issues" value={stats.total_issues} />
            <StatCard label="Critical" value={stats.critical_issues} accent="text-critical" />
            <StatCard label="Pending Verification" value={stats.pending_verification} accent="text-medium" />
            <StatCard label="Resolved" value={stats.resolved_issues} accent="text-low" />
            <StatCard label="Active Buses" value={stats.active_buses} accent="text-accent" />
          </div>
        )}

        {!loading && !error && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200">Recent Detections</h3>
              <Link to="/issues" className="text-xs text-accent hover:underline">View all issues →</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-border">
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Bus</th>
                  <th className="pb-2">Priority</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((issue) => (
                  <tr key={issue.id} className="border-b border-border/50">
                    <td className="py-2">
                      <Link to={`/issues/${issue.id}`} className="hover:text-accent">{issue.issue_type}</Link>
                    </td>
                    <td className="py-2 text-slate-400">{issue.bus_id}</td>
                    <td className="py-2"><PriorityBadge priority={issue.priority} /></td>
                    <td className="py-2"><StatusBadge status={issue.status} /></td>
                    <td className="py-2 text-slate-400">{Math.round(issue.confidence * 100)}%</td>
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
