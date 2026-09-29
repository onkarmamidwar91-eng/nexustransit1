import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet'
import L from 'leaflet'
import Topbar from '../components/Topbar'
import { Loading, ErrorState } from '../components/Common'
import { PriorityBadge, StatusBadge, PRIORITY_COLOR_HEX } from '../components/Badges'
import api from '../services/api'

const busIcon = new L.DivIcon({
  html: '<div style="background:#3b82f6;width:12px;height:12px;border-radius:3px;border:2px solid white;"></div>',
  className: '',
  iconSize: [16, 16],
})

const PUNE_CENTER = [18.5204, 73.8567]

export default function LiveMap() {
  const [issues, setIssues] = useState([])
  const [buses, setBuses] = useState([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [issuesRes, busesRes] = await Promise.all([api.getIssues(), api.getBuses()])
      setIssues(issuesRes.data)
      setBuses(busesRes.data)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const verify = async (id) => { await api.verifyIssue(id); load() }
  const reject = async (id) => { await api.rejectIssue(id); load() }

  return (
    <div>
      <Topbar title="Live Map" onDataChanged={load} />
      <div className="p-6">
        {loading && <Loading />}
        {error && <ErrorState label="Couldn't reach the backend API." />}
        {!loading && !error && (
          <div className="glass-card overflow-hidden" style={{ height: '75vh' }}>
            <MapContainer center={PUNE_CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {buses.map((bus) => (
                bus.last_latitude && (
                  <Marker key={bus.bus_id} position={[bus.last_latitude, bus.last_longitude]} icon={busIcon}>
                    <Popup>
                      <div className="text-sm">
                        <strong>{bus.bus_id}</strong><br />
                        {bus.route_name}<br />
                        Status: {bus.status}
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
              {issues.map((issue) => (
                <CircleMarker
                  key={issue.id}
                  center={[issue.latitude, issue.longitude]}
                  radius={8}
                  pathOptions={{ color: PRIORITY_COLOR_HEX(issue.priority), fillColor: PRIORITY_COLOR_HEX(issue.priority), fillOpacity: 0.7 }}
                >
                  <Popup minWidth={220}>
                    <div className="text-sm space-y-1">
                      <div className="font-semibold">NX-{String(issue.id).padStart(5, '0')} · {issue.issue_type}</div>
                      <div>Confidence: {Math.round(issue.confidence * 100)}%</div>
                      <div>Bus: {issue.bus_id}</div>
                      <div>Route: {issue.route_id}</div>
                      <div>Priority: <PriorityBadge priority={issue.priority} /></div>
                      <div>Status: <StatusBadge status={issue.status} /></div>
                      {issue.status === 'PENDING_VERIFICATION' && (
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => verify(issue.id)} className="bg-green-600 text-white text-xs px-2 py-1 rounded">VERIFY</button>
                          <button onClick={() => reject(issue.id)} className="bg-red-600 text-white text-xs px-2 py-1 rounded">REJECT</button>
                        </div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  )
}
