import { useEffect, useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { settingsApi } from '../../services/api'
import { formatDateTime } from '../../utils/helpers'

const actionStyle = (action) => {
  if (action === 'delete') return { background: 'rgba(239,68,68,0.12)', color: '#F87171' }
  if (action === 'create') return { background: 'rgba(34,197,94,0.12)', color: '#4ADE80' }
  return { background: 'rgba(59,130,246,0.12)', color: '#60A5FA' }
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    settingsApi.getAuditLogs({ page, limit: 30 })
      .then((r) => { setLogs(r.data.items || []); setTotalPages(r.data.totalPages || 1) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="animate-fade-in">
      <PageHeader title="Audit Logs" backTo="/settings" subtitle="Read-only system log" />
      {loading ? <LoadingSpinner /> : (
        <div className="rounded-xl overflow-hidden" style={{ background: '#111827', border: '1px solid #1E293B' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: '#0F172A', borderBottom: '1px solid #1E293B' }}>
                <tr>
                  {['Action', 'Collection', 'Document ID', 'Changed By', 'Timestamp'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3 whitespace-nowrap" style={{ color: '#64748B' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-sm" style={{ color: '#475569' }}>No logs found</td>
                  </tr>
                ) : logs.map((l) => (
                  <tr
                    key={l._id}
                    style={{ borderBottom: '1px solid #1E293B' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1E293B'}
                    onMouseLeave={(e) => e.currentTarget.style.background = ''}
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium" style={actionStyle(l.action)}>
                        {l.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize" style={{ color: '#94A3B8' }}>{l.collection}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#64748B' }}>{l.documentId}</td>
                    <td className="px-4 py-3" style={{ color: '#CBD5E1' }}>{l.changedBy}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#64748B' }}>{formatDateTime(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
