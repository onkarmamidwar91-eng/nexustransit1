import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const [username, setUsername] = useState('operator')
  const [password, setPassword] = useState('operator123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.login(username, password)
      localStorage.setItem('nexustransit_token', data.access_token)
      localStorage.setItem('nexustransit_username', data.username)
      localStorage.setItem('nexustransit_role', data.role)
      navigate('/')
    } catch (e) {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="glass-card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white">NexusTransit</h1>
        <p className="text-sm text-slate-400 mt-1 mb-6">AI-Powered Mobile Urban Intelligence Platform</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/80 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-xs text-slate-500 border-t border-border pt-4">
          <p className="mb-1">Demo accounts (seeded):</p>
          <p>admin / admin123 · operator / operator123 · field / field123</p>
        </div>
      </div>
    </div>
  )
}
