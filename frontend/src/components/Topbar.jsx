import { useState } from 'react'
import { Play, Loader2, LogOut } from 'lucide-react'
import api from '../services/api'

export default function Topbar({ title, onDataChanged }) {
  const [running, setRunning] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const username = localStorage.getItem('nexustransit_username')
  const role = localStorage.getItem('nexustransit_role')

  const runDemo = async () => {
    setRunning(true)
    setLastResult(null)
    try {
      const { data } = await api.runDemo()
      setLastResult(`${data.issue_type} detected · ${Math.round(data.confidence * 100)}% confidence · ${data.priority} priority (Bus ${data.bus_id})`)
      onDataChanged?.()
    } catch (e) {
      setLastResult('Demo run failed — is the backend running?')
    } finally {
      setRunning(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('nexustransit_token')
    localStorage.removeItem('nexustransit_username')
    localStorage.removeItem('nexustransit_role')
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-10 bg-surface/90 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {lastResult && <p className="text-xs text-accent mt-1">{lastResult}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={runDemo}
          disabled={running}
          className="flex items-center gap-2 bg-accent hover:bg-accent/80 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          Run Demo
        </button>
        <div className="text-right text-xs text-slate-400 pl-3 border-l border-border">
          <div className="text-slate-200">{username || 'Guest'}</div>
          <div>{role || ''}</div>
        </div>
        {username && (
          <button onClick={logout} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5" title="Log out">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  )
}
