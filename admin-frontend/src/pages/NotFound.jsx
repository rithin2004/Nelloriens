import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Home, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const pageName  = location.pathname.split('/').filter(Boolean).join(' / ') || '—'

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#eef3fd' }}>
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{ background: '#FFFFFF', border: '1px solid #dce8fb', boxShadow: '0 8px 32px rgba(10,61,149,0.1)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(239,68,68,0.1)' }}
        >
          <AlertTriangle className="w-8 h-8" style={{ color: '#EF4444' }} />
        </div>

        <h1 className="text-5xl font-extrabold mb-2" style={{ color: '#0a3d95' }}>404</h1>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Page not found</h2>
        <p className="text-sm text-slate-500 mb-1">
          The page <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: '#F1F5F9' }}>{location.pathname}</span> doesn't exist.
        </p>
        <p className="text-sm text-slate-400 mb-7">
          It may have been moved, deleted, or the link might be incorrect.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all hover:bg-slate-100"
            style={{ border: '1px solid #E2E8F0', color: '#475569' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard', { replace: true })}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#0a3d95,#072d6e)', boxShadow: '0 4px 12px rgba(10,61,149,0.25)' }}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
