import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, AlertTriangle, ClipboardCheck, Wrench, Bus, BarChart3, Settings as SettingsIcon } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/map', label: 'Live Map', icon: Map },
  { to: '/issues', label: 'Issues', icon: AlertTriangle },
  { to: '/verification', label: 'Verification Queue', icon: ClipboardCheck },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/buses', label: 'Buses', icon: Bus },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-panel/60 border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-6 border-b border-border">
        <h1 className="text-lg font-bold text-white tracking-tight">NexusTransit</h1>
        <p className="text-xs text-slate-400 mt-0.5">AI-Powered Mobile Urban Intelligence Platform</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-accent/20 text-accent border border-accent/30' : 'text-slate-300 hover:bg-white/5'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-border text-xs text-slate-500">
        v0.1.0 — MVP Demo
      </div>
    </aside>
  )
}
