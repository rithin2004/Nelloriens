import { useState, useEffect } from 'react'
import { rolesApi } from '../../services/api'
import useRolesStore from '../../store/rolesStore'
import PageHeader from '../../components/common/PageHeader'
import FormModal from '../../components/common/FormModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PermissionsEditor from './PermissionsEditor'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ShieldCheck, Loader } from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const inp    = 'w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-all text-slate-700'
const inpS   = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
const lbl    = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'
const focusOn  = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const focusOff = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

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
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Create modal
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createPerms, setCreatePerms] = useState({})
  const [creating,    setCreating]   = useState(false)

  // Edit modal
  const [editOpen,  setEditOpen]  = useState(false)
  const [editId,    setEditId]    = useState(null)
  const [editName,  setEditName]  = useState('')
  const [editPerms, setEditPerms] = useState({})
  const [saving,    setSaving]    = useState(false)

  // Data from Zustand store — updated by useSSE in Layout automatically
  const { items: data, loading, fetch } = useRolesStore()

  useEffect(() => { fetch({ limit: 100 }) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create ────────────────────────────────────────��───────────────────────
  const openCreate = () => { setCreateName(''); setCreatePerms({}); setCreateOpen(true) }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createName.trim()) { toast.error('Role name is required'); return }
    setCreating(true)
    try {
      await rolesApi.create({ name: createName.trim(), permissions: createPerms })
      toast.success('Role created')
      setCreateOpen(false)
      // No fetchData() — listener updates automatically
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed')
    } finally { setCreating(false) }
  }

  // ── Edit ───��─────────────────────────────────────────────────────────────
  const openEdit = (role) => {
    setEditId(role._id)
    setEditName(role.name || '')
    setEditPerms(role.permissions || {})
    setEditOpen(true)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await rolesApi.update(editId, { name: editName.trim(), permissions: editPerms })
      toast.success('Role updated')
      setEditOpen(false)
      // No fetchData() — listener updates automatically
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  // ── Delete ──────────────��─────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    try { await rolesApi.delete(deleteId); toast.success('Role deleted'); setDeleteId(null) }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
    finally { setDeleting(false) }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Roles"
        subtitle="Manage access control roles and permissions"
        backTo="/users/list"
        action={
          <button onClick={openCreate}
            className="btn-shine flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl"
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
              {data.map((role) => {
                const isSA = role._id === 'ROL00001'
                return (
                  <tr key={role._id} style={{ borderBottom: '1px solid #F1F5F9' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = PB}
                    onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: PL, color: P }}>{role._id}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 capitalize">{role.name}</td>
                    <td className="px-4 py-3 max-w-sm">
                      {isSA
                        ? <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Full Access</span>
                        : <PermissionsSummary permissions={role.permissions} />
                      }
                    </td>
                    <td className="px-4 py-3">
                      {!isSA && (
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(role)} title="Edit"
                            className="p-1.5 rounded-lg text-slate-400 transition-colors"
                            onMouseEnter={(e) => { e.currentTarget.style.color = P; e.currentTarget.style.background = PB }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(role._id)} title="Delete"
                            className="p-1.5 rounded-lg text-slate-400 transition-colors"
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEE2E2' }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create Modal ── */}
      <FormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Role" maxWidth="max-w-2xl">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className={lbl}>Role Name *</label>
            <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
              placeholder="e.g. Editor, Reporter…"
              value={createName} onChange={(e) => setCreateName(e.target.value)} required />
          </div>
          <PermissionsEditor permissions={createPerms} onChange={setCreatePerms} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)}
              className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100"
              style={{ border: '1px solid #E2E8F0' }}>Cancel</button>
            <button type="submit" disabled={creating}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
              {creating && <Loader className="w-4 h-4 animate-spin" />}
              {creating ? 'Creating…' : 'Create Role'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* ── Edit Modal ── */}
      <FormModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Role" maxWidth="max-w-2xl">
        <form onSubmit={handleEdit} className="space-y-5">
          <div>
            <label className={lbl}>Role Name *</label>
            <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
              value={editName} onChange={(e) => setEditName(e.target.value)} required />
          </div>
          <PermissionsEditor permissions={editPerms} onChange={setEditPerms} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditOpen(false)}
              className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100"
              style={{ border: '1px solid #E2E8F0' }}>Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
              {saving && <Loader className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal isOpen={!!deleteId} title="Delete Role"
        message="Deleting this role will affect users assigned to it."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  )
}
