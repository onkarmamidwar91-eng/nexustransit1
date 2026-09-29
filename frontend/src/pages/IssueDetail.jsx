import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar'
import { Loading, ErrorState } from '../components/Common'
import { PriorityBadge, StatusBadge } from '../components/Badges'
import api from '../services/api'

const TIMELINE_STEPS = ['DETECTED', 'PENDING_VERIFICATION', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']

export default function IssueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [issue, setIssue] = useState(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [assignForm, setAssignForm] = useState({ department: 'Road Maintenance', assigned_to: 'Road Team A' })

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const { data } = await api.getIssue(id)
      setIssue(data)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const act = async (fn) => {
    try {
      await fn()
      load()
    } catch (e) {
      alert('Action failed — you may need to log in first.')
      navigate('/login')
    }
  }

  const currentStepIndex = issue ? TIMELINE_STEPS.indexOf(issue.status === 'REJECTED' ? 'PENDING_VERIFICATION' : issue.status) : -1

  return (
    <div>
      <Topbar title={`Issue NX-${String(id).padStart(5, '0')}`} onDataChanged={load} />
      <div className="p-6 space-y-6">
        {loading && <Loading />}
        {error && <ErrorState label="Issue not found." />}

        {issue && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-5 md:col-span-2 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{issue.issue_type}</h3>
                  <PriorityBadge priority={issue.priority} />
                  <StatusBadge status={issue.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                  <div><span className="text-slate-500">AI Confidence:</span> {Math.round(issue.confidence * 100)}%</div>
                  <div><span className="text-slate-500">Source:</span> {issue.source}</div>
                  <div><span className="text-slate-500">Bus:</span> {issue.bus_id}</div>
                  <div><span className="text-slate-500">Route:</span> {issue.route_id}</div>
                  <div><span className="text-slate-500">GPS:</span> {issue.latitude}, {issue.longitude}</div>
                  <div><span className="text-slate-500">Detected:</span> {new Date(issue.timestamp).toLocaleString()}</div>
                  <div><span className="text-slate-500">Observations:</span> {issue.observation_count}</div>
                  <div><span className="text-slate-500">Priority score:</span> {issue.priority_score}/100</div>
                </div>
                {issue.priority_reason && (
                  <p className="text-xs text-slate-500 border-t border-border pt-3">{issue.priority_reason}</p>
                )}
                {issue.image_path ? (
                  <img src={`${import.meta.env.VITE_API_BASE_URL}/${issue.image_path.replace(/^\.\//, '')}`} alt="Detection" className="rounded-lg mt-2 max-h-64 object-cover" />
                ) : (
                  <div className="mt-2 h-40 rounded-lg bg-white/5 border border-dashed border-border flex items-center justify-center text-slate-500 text-xs">
                    No image attached (DEMO_DETECTION)
                  </div>
                )}
              </div>

              <div className="glass-card p-5 space-y-2">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Timeline</h4>
                {TIMELINE_STEPS.map((step, i) => (
                  <div key={step} className={`text-xs flex items-center gap-2 ${i <= currentStepIndex ? 'text-accent' : 'text-slate-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${i <= currentStepIndex ? 'bg-accent' : 'bg-slate-700'}`} />
                    {step.replace('_', ' ')}
                  </div>
                ))}
                {issue.status === 'REJECTED' && <div className="text-xs text-red-400 mt-2">Rejected by verifier</div>}
              </div>
            </div>

            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold text-slate-200 mb-3">Actions</h4>
              <div className="flex flex-wrap gap-2">
                {issue.status === 'PENDING_VERIFICATION' && (
                  <>
                    <button onClick={() => act(() => api.verifyIssue(issue.id))} className="bg-green-600 hover:bg-green-500 text-white text-xs font-medium px-3 py-2 rounded-lg">VERIFY</button>
                    <button onClick={() => act(() => api.rejectIssue(issue.id))} className="bg-red-600 hover:bg-red-500 text-white text-xs font-medium px-3 py-2 rounded-lg">REJECT</button>
                  </>
                )}
                {issue.status === 'VERIFIED' && (
                  <div className="flex items-end gap-2">
                    <input
                      className="bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-white"
                      value={assignForm.department}
                      onChange={(e) => setAssignForm({ ...assignForm, department: e.target.value })}
                      placeholder="Department"
                    />
                    <input
                      className="bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-white"
                      value={assignForm.assigned_to}
                      onChange={(e) => setAssignForm({ ...assignForm, assigned_to: e.target.value })}
                      placeholder="Assigned to"
                    />
                    <button onClick={() => act(() => api.assignIssue(issue.id, assignForm))} className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-3 py-2 rounded-lg">ASSIGN</button>
                  </div>
                )}
                {issue.status === 'ASSIGNED' && (
                  <button onClick={() => act(() => api.progressIssue(issue.id))} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium px-3 py-2 rounded-lg">MARK IN PROGRESS</button>
                )}
                {issue.status === 'IN_PROGRESS' && (
                  <button onClick={() => act(() => api.resolveIssue(issue.id))} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-2 rounded-lg">RESOLVE</button>
                )}
                {['RESOLVED', 'REJECTED'].includes(issue.status) && (
                  <span className="text-xs text-slate-500">No further actions — issue is {issue.status.toLowerCase()}.</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
