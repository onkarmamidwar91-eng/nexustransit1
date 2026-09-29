import Topbar from '../components/Topbar'
import api from '../services/api'
import { useEffect, useState } from 'react'

export default function Settings() {
  const [health, setHealth] = useState(null)
  useEffect(() => { api.health().then(({ data }) => setHealth(data)).catch(() => setHealth(null)) }, [])

  return (
    <div>
      <Topbar title="Settings" />
      <div className="p-6 space-y-4 max-w-lg">
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">System Status</h3>
          {health ? (
            <div className="text-sm text-slate-400 space-y-1">
              <div>App: <span className="text-white">{health.app}</span></div>
              <div>Environment: <span className="text-white">{health.environment}</span></div>
              <div>Demo mode: <span className="text-white">{String(health.demo_mode)}</span></div>
              <div>Database: <span className="text-white">{health.database}</span></div>
            </div>
          ) : (
            <p className="text-xs text-red-400">Backend unreachable — check VITE_API_BASE_URL.</p>
          )}
        </div>

        <div className="glass-card p-5 space-y-1 text-xs text-slate-500">
          <p><strong className="text-slate-300">API base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</p>
          <p className="pt-2">NexusTransit is an MVP prototype for SIH 2026 (PS ID SIH26124). Detections in Demo Mode use labeled sample data, not a trained model. GPS is simulated AIS-140/VLTD data, not a live vehicle feed.</p>
        </div>
      </div>
    </div>
  )
}
