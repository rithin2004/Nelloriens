import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { setupApi } from './services/api'
import AppRoutes from './routes/AppRoutes'

/**
 * SetupGuard — runs on every app load.
 * Calls GET /setup/status; if not initialized and not already on /setup, redirect there.
 */
function SetupGuard({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (location.pathname === '/setup') { setChecked(true); return }
    setupApi.getStatus()
      .then((r) => {
        if (!r.data.data?.initialized) navigate('/setup', { replace: true })
      })
      .catch(() => {/* network error — let the app load normally */})
      .finally(() => setChecked(true))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!checked && location.pathname !== '/setup') {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading…</div>
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          duration: 3000,
          style: { background: '#FFFFFF', color: '#0F172A', border: '1px solid #dce8fb', borderRadius: '10px', fontSize: '14px', boxShadow: '0 8px 24px rgba(10,61,149,0.12)' },
          success: { iconTheme: { primary: '#16A34A', secondary: '#FFFFFF' } },
          error:   { iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' } },
        }}
      />
      <SetupGuard>
        <AppRoutes />
      </SetupGuard>
    </BrowserRouter>
  )
}
