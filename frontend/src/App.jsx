import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LiveMap from './pages/LiveMap'
import Issues from './pages/Issues'
import IssueDetail from './pages/IssueDetail'
import VerificationQueue from './pages/VerificationQueue'
import Maintenance from './pages/Maintenance'
import Buses from './pages/Buses'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function RequireAuth({ children }) {
  const token = localStorage.getItem('nexustransit_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function Layout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/map" element={<LiveMap />} />
                <Route path="/issues" element={<Issues />} />
                <Route path="/issues/:id" element={<IssueDetail />} />
                <Route path="/verification" element={<VerificationQueue />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/buses" element={<Buses />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />
    </Routes>
  )
}
