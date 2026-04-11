import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '../../services/api'
import PageHeader from '../../components/common/PageHeader'
import ConfirmModal from '../../components/common/ConfirmModal'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Link2, Search, Users } from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

export default function UsersList() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [resetLinkMap, setResetLinkMap] = useState({})

  const fetchData = () => {
    setLoading(true)
    usersApi.getAll({ page, limit: 20, search: search || undefined })
      .then((r) => { setData(r.data.items || []); setTotalPages(r.data.totalPages || 1); setTotal(r.data.total || 0) })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [page, search])

  const handleDelete = async () => {
    setDeleting(true)
    try { await usersApi.delete(deleteId); toast.success('User deleted'); setDeleteId(null); fetchData() }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
    finally { setDeleting(false) }
  }

  const handleResetLink = async (id) => {
    try {
      const r = await usersApi.getResetLink(id)
      setResetLinkMap((p) => ({ ...p, [id]: r.data.resetLink }))
      navigator.clipboard.writeText(r.data.resetLink)
      toast.success('Reset link copied to clipboard')
    } catch { toast.error('Failed to get reset link') }
  }

  const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
  const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
  const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Users"
        subtitle={total > 0 ? `${total} admin users` : undefined}
        action={
          <button onClick={() => navigate('/users/create')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all"
            style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 4px 14px rgba(10,61,149,0.3)' }}>
            <Plus className="w-4 h-4" /> Add User
          </button>
        }
      />

      <div className="flex gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search name, email…"
            className="pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none w-64 transition-all text-slate-700"
            style={inpStyle} onFocus={inpFocus} onBlur={inpBlur} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-white" style={{ border: '1px solid #E2E8F0' }}>
          <Users className="w-10 h-10 mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No users yet</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: PB, borderBottom: `1px solid ${PL}` }}>
                <tr>
                  {['User', 'Email', 'Role', 'Status', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3 text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #F1F5F9' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = PB}
                    onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-400">{u._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: PL, color: P }}>{u.roleName || u.roleId || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: u.active !== false ? '#DCFCE7' : '#FEE2E2', color: u.active !== false ? '#15803D' : '#DC2626' }}>
                        {u.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleResetLink(u._id)} title="Copy reset link"
                          className="p-1.5 rounded-lg text-slate-400 transition-colors"
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#0891b2'; e.currentTarget.style.background = '#CFFAFE' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
                          <Link2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/users/update/${u._id}`)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-400 transition-colors"
                          onMouseEnter={(e) => { e.currentTarget.style.color = P; e.currentTarget.style.background = PB }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        {u._id !== 'USR00001' && (
                          <button onClick={() => setDeleteId(u._id)} title="Delete"
                            className="p-1.5 rounded-lg text-slate-400 transition-colors"
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEE2E2' }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} title="Delete User"
        message="This will permanently delete this user and their Firebase account."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  )
}
