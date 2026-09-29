import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const client = axios.create({ baseURL: API_BASE_URL })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexustransit_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const api = {
  // Auth
  login: (username, password) => client.post('/api/auth/login', { username, password }),

  // Dashboard
  getStats: () => client.get('/api/dashboard/stats'),
  getAnalytics: () => client.get('/api/dashboard/analytics'),

  // Issues
  getIssues: (params = {}) => client.get('/api/issues', { params }),
  getIssue: (id) => client.get(`/api/issues/${id}`),
  verifyIssue: (id) => client.post(`/api/issues/${id}/verify`),
  rejectIssue: (id) => client.post(`/api/issues/${id}/reject`),
  assignIssue: (id, payload) => client.post(`/api/issues/${id}/assign`, payload),
  progressIssue: (id) => client.post(`/api/issues/${id}/progress`),
  resolveIssue: (id) => client.post(`/api/issues/${id}/resolve`),

  // Buses
  getBuses: () => client.get('/api/buses'),
  getBus: (busId) => client.get(`/api/buses/${busId}`),

  // Demo
  runDemo: () => client.post('/api/demo/run'),

  // Upload
  uploadImage: (file, busId) => {
    const form = new FormData()
    form.append('file', file)
    if (busId) form.append('bus_id', busId)
    return client.post('/api/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  health: () => client.get('/api/health'),
}

export default api
