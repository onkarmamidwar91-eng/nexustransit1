import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/Topbar'
import { Loading, ErrorState, EmptyState } from '../components/Common'
import { PriorityBadge } from '../components/Badges'
import api from '../services/api'

export default function VerificationQueue() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const { data } = await api.getIssues({ status: 'PENDING_VERIFICATION' })
      setIssues(data)
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
      alert('You need to log in to verify/reject issues.')
    }
  }

  return (
    <div>
      <Topbar title="Verification Queue" onDataChanged={load} />
      <div className="p-6 space-y-4">
        {loading && <Loading />}
        {error && <ErrorState label="Couldn't load the verification queue." />}
        {!loading && !error && issues.length === 0 && <EmptyState label="Nothing pending verification — all caught up." />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {issues.map((issue) => (
            <div key={issue.id} className="glass-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Link to={`/issues/${issue.id}`} className="font-semibold text-white hover:text-accent">
                  {issue.issue_type}
                </Link>
                <PriorityBadge priority={issue.priority} />
              </div>
              <div className="h-28 rounded-lg bg-white/5 border border-dashed border-border flex items-center justify-center text-slate-500 text-xs">
                {issue.image_path ? (
                  <img src={`${import.meta.env.VITE_API_BASE_URL}/${issue.image_path.replace(/^\.\//, '')}`} alt="" className="h-full w-full object-cover rounded-lg" />
                ) : 'No image (DEMO_DETECTION)'}
              </div>
              <div className="text-xs text-slate-400 space-y-0.5">
                <div>Confidence: {Math.round(issue.confidence * 100)}%</div>
                <div>Bus: {issue.bus_id} · {issue.route_id}</div>
                <div>{issue.latitude}, {issue.longitude}</div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => act(() => api.verifyIssue(issue.id))} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-medium py-1.5 rounded-lg">VERIFY</button>
                <button onClick={() => act(() => api.rejectIssue(issue.id))} className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-medium py-1.5 rounded-lg">REJECT</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
