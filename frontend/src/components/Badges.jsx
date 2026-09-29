const PRIORITY_STYLES = {
  CRITICAL: 'bg-critical/20 text-critical border-critical/40',
  HIGH: 'bg-high/20 text-high border-high/40',
  MEDIUM: 'bg-medium/20 text-medium border-medium/40',
  LOW: 'bg-low/20 text-low border-low/40',
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW}`}>
      {priority}
    </span>
  )
}

const STATUS_STYLES = {
  DETECTED: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  PENDING_VERIFICATION: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  VERIFIED: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  REJECTED: 'bg-red-500/20 text-red-300 border-red-500/40',
  ASSIGNED: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  IN_PROGRESS: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  RESOLVED: 'bg-green-500/20 text-green-300 border-green-500/40',
}

export function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border whitespace-nowrap ${STATUS_STYLES[status] || STATUS_STYLES.DETECTED}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export function PRIORITY_COLOR_HEX(priority) {
  return { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' }[priority] || '#22c55e'
}
