import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import ConfirmModal from '../../components/common/ConfirmModal'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { contactApi } from '../../services/api'
import { formatDateTime } from '../../utils/helpers'

export default function ContactMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteId, setDeleteId] = useState(null)

  const fetchMessages = () => {
    setLoading(true)
    contactApi.getMessages({ page, limit: 20 })
      .then((r) => { setMessages(r.data.items || []); setTotalPages(r.data.totalPages || 1) })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMessages() }, [page])

  const handleDelete = async () => {
    try { await contactApi.deleteMessage(deleteId); toast.success('Deleted'); setDeleteId(null); fetchMessages() }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Contact Messages" backTo="/contact" />
      {loading ? <LoadingSpinner /> : (
        <div className="rounded-xl overflow-hidden" style={{ background: '#111827', border: '1px solid #1E293B' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: '#0F172A', borderBottom: '1px solid #1E293B' }}>
                <tr>
                  {['Name', 'Email', 'Message', 'Submitted At', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3" style={{ color: '#64748B' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-sm" style={{ color: '#475569' }}>No messages yet</td></tr>
                ) : messages.map((m) => (
                  <tr
                    key={m._id}
                    style={{ borderBottom: '1px solid #1E293B' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1E293B'}
                    onMouseLeave={(e) => e.currentTarget.style.background = ''}
                  >
                    <td className="px-4 py-3 font-medium text-white">{m.name}</td>
                    <td className="px-4 py-3" style={{ color: '#94A3B8' }}>{m.email}</td>
                    <td className="px-4 py-3 max-w-xs" style={{ color: '#94A3B8' }}><p className="truncate">{m.message}</p></td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#64748B' }}>{formatDateTime(m.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteId(m._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = ''}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
      <ConfirmModal isOpen={!!deleteId} title="Delete Message" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
