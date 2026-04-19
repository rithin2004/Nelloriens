import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import Pagination from '../components/common/Pagination'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { dashboardApi } from '../services/api'
import { timeAgo, formatDate } from '../utils/helpers'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const ACTION_STYLES = {
  create: { bg: '#DCFCE7', color: '#16A34A', label: 'Created' },
  update: { bg: '#DBEAFE', color: '#2563EB', label: 'Updated' },
  delete: { bg: '#FEE2E2', color: '#DC2626', label: 'Deleted' },
  login:  { bg: '#F3E8FF', color: '#7C3AED', label: 'Login'   },
}

function ActionBadge({ action }) {
  const s = ACTION_STYLES[action] || { bg: '#F1F5F9', color: '#64748B', label: action }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export default function ActivityLog() {
  const [logs,       setLogs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)

  useEffect(() => {
    setLoading(true)
    dashboardApi.getActivity({ page, limit: 30 })
      .then((r) => {
        setLogs(r.data?.data || [])
        setTotalPages(r.data?.pagination?.totalPages || 1)
        setTotal(r.data?.pagination?.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Activity Log"
        subtitle={total ? `${total} total actions recorded` : 'All admin actions'}
        backTo="/dashboard"
      />

      {loading ? <LoadingSpinner /> : logs.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: '#FFFFFF', border: '1px dashed #CBD5E1' }}>
          <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log._id}
              className="flex items-start gap-4 rounded-xl px-5 py-4 bg-white transition-all hover:shadow-sm"
              style={{ border: `1px solid ${PL}` }}
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold mt-0.5"
                style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}
              >
                {log.email?.[0]?.toUpperCase() || '?'}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">
                    {log.email || log.uid || 'Unknown user'}
                  </span>
                  {log.role && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ background: PB, color: P }}>
                      {log.role}
                    </span>
                  )}
                  <ActionBadge action={log.action} />
                  <span className="text-sm text-slate-500 capitalize">{log.module || '—'}</span>
                </div>

                {/* Meta title */}
                {log.meta?.title && (
                  <p className="text-sm text-slate-600 mt-0.5 truncate">"{log.meta.title}"</p>
                )}

                {/* Secondary info */}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {log.targetId && (
                    <span className="text-xs font-mono text-slate-400">ID: {log.targetId}</span>
                  )}
                  {log.ip && (
                    <span className="text-xs text-slate-400">IP: {log.ip}</span>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-right shrink-0">
                <p className="text-xs font-medium text-slate-500">{timeAgo(log.createdAt)}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDate(log.createdAt)}</p>
              </div>
            </div>
          ))}

          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0) }} />
        </div>
      )}
    </div>
  )
}
