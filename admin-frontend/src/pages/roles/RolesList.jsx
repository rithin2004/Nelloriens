import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rolesApi } from '../../services/api'
import PageHeader from '../../components/common/PageHeader'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const LEVEL_BADGE = {
  none:       { bg: '#F1F5F9', color: '#94A3B8' },
  read:       { bg: '#DBEAFE', color: '#1D4ED8' },
  read_write: { bg: '#DCFCE7', color: '#15803D' },
  full:       { bg: '#FEF3C7', color: '#D97706' },
}

function PermissionsSummary({ permissions = {} }) {
  const entries = Object.entries(permissions).filter(([, v]) => v && v !== 'none')
  if (!entries.length) return <span className="text-xs text-slate-400">No permissions</span>
  return (
    <div className="flex flex-wrap gap-1">
      {entries.slice(0, 4).map(([mod, level]) => {
        const s = LEVEL_BADGE[level] || LEVEL_BADGE.read
        return (
          <span key={mod} className="px-1.5 py-0.5 rounded text-xs font-medium"
            style={{ background: s.bg, color: s.color }}>
            {mod}:{level === 'read_write' ? 'rw' : level === 'full' ? 'all' : level}
          </span>
        )
      })}
      {entries.length > 4 && <span className="text-xs text-slate-400">+{entries.length - 4} more</span>}
    </div>
  )
}

export default function RolesList() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = () => {
    setLoading(true)
    rolesApi.getAll({ limit: 100 })
      .then((r) => setData(r.data.items || []))
      .catch(() => toast.error('Failed to load roles'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try { await rolesApi.delete(deleteId); toast.success('Role deleted'); setDeleteId(null); fetchData() }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
    finally { setDeleting(false) }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Roles"
        subtitle="Manage access control roles and permissions"
        action={
          <button onClick={() => navigate('/roles/create')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all"
            style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 4px 14px rgba(10,61,149,0.3)' }}>
            <Plus className="w-4 h-4" /> Add Role
          </button>
        }
      />

      {loading ? <LoadingSpinner /> : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-white" style={{ border: '1px solid #E2E8F0' }}>
          <ShieldCheck className="w-10 h-10 mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No roles yet</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #E2E8F0' }}>
          <table className="w-full text-sm">
            <thead style={{ background: PB, borderBottom: `1px solid ${PL}` }}>
              <tr>
                {['Role ID', 'Name', 'Permissions', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3 text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((role) => (
                <tr key={role._id} style={{ borderBottom: '1px solid #F1F5F9' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = PB}
                  onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: PL, color: P }}>{role._id}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 capitalize">{role.name}</td>
                  <td className="px-4 py-3 max-w-sm">
                    {role.name === 'superadmin'
                      ? <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Full Access</span>
                      : <PermissionsSummary permissions={role.permissions} />
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => navigate(`/roles/update/${role._id}`)} title="Edit"
                        className="p-1.5 rounded-lg text-slate-400 transition-colors"
                        onMouseEnter={(e) => { e.currentTarget.style.color = P; e.currentTarget.style.background = PB }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      {role._id !== 'ROL00001' && (
                        <button onClick={() => setDeleteId(role._id)} title="Delete"
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
      )}

      <ConfirmModal isOpen={!!deleteId} title="Delete Role"
        message="Deleting this role will affect users assigned to it."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  )
}
