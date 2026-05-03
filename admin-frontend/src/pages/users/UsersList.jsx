import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '../../services/api'
import { useDebounce } from '../../hooks/useDebounce'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../utils/firebase'
import useUsersStore from '../../store/usersStore'
import useRolesStore from '../../store/rolesStore'
import PageHeader from '../../components/common/PageHeader'
import FormModal from '../../components/common/FormModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Search, Users, ShieldCheck, Loader } from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const inp    = 'w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-all text-slate-700'
const inpS   = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
const inpLocked = { background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#94A3B8' }
const lbl    = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'
const focusOn  = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const focusOff = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

const PAGE_SIZE = 20

export default function UsersList() {
  const navigate = useNavigate()
  const [page,   setPage]   = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  // Data from Zustand stores — updated by useSSE in Layout automatically
  const { items: data, total, totalPages, loading, fetch: fetchUsers } = useUsersStore()
  const { items: rolesData, fetch: fetchRoles } = useRolesStore()
  const roles = (rolesData || []).filter(r => r._id !== 'ROL00001')

  // Create modal
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', roleId: '' })
  const [creating,   setCreating]   = useState(false)
  const [successLink, setSuccessLink] = useState('')

  // Edit modal
  const [editOpen, setEditOpen] = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', roleId: '', active: true })
  const [saving,   setSaving]   = useState(false)

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers({ page, limit: PAGE_SIZE, search: debouncedSearch }) }, [page, debouncedSearch])

  useEffect(() => { fetchRoles({ limit: 100 }) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create ────────────────────────────────────────────────────────────────────
  const openCreate = () => { setCreateForm({ name: '', email: '', phone: '', roleId: '' }); setCreateOpen(true) }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createForm.name.trim()) { toast.error('Name is required'); return }
    if (!createForm.roleId) { toast.error('Role is required'); return }
    setCreating(true)
    try {
      const res = await usersApi.create(createForm)
      const link = res.data?.data?.resetLink || res.data?.resetLink

      // Trigger Firebase's official email template from the client side
      try {
        await sendPasswordResetEmail(auth, createForm.email)
        toast.success('User created and setup email sent!')
      } catch {
        toast.success('User created, but email failed to send.')
      }

      if (link) {
        setSuccessLink(link)
      } else {
        setCreateOpen(false)
      }
      fetchUsers({ page, limit: PAGE_SIZE, search: debouncedSearch })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed')
    } finally { setCreating(false) }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────────
  const openEdit = async (user) => {
    setEditId(user._id)
    setEditForm({ name: user.name || '', phone: user.phone || '', roleId: user.roleId || '', active: user.active !== false })
    setEditOpen(true)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await usersApi.update(editId, { ...editForm, active: editForm.active === true || editForm.active === 'true' })
      toast.success('User updated')
      setEditOpen(false)
      fetchUsers({ page, limit: PAGE_SIZE, search: debouncedSearch })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    try {
      await usersApi.delete(deleteId)
      toast.success('User deleted')
      setDeleteId(null)
      fetchUsers({ page, limit: PAGE_SIZE, search: debouncedSearch })
    }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
    finally { setDeleting(false) }
  }

  const isSuperadminEdit = editId === 'USR00001'

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Users"
        subtitle={total > 0 ? `${total} admin users` : undefined}
        action={
          <div className="flex gap-2">
            <button onClick={() => navigate('/roles/list')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all"
              style={{ border: `1px solid ${PL}`, background: PB, color: P }}>
              <ShieldCheck className="w-4 h-4" /> Manage Roles
            </button>
            <button onClick={openCreate}
              className="btn-shine flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 4px 14px rgba(10,61,149,0.3)' }}>
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
        }
      />

      <div className="flex gap-3 mb-5">
        <div className="relative">
          <label htmlFor="search-users" className="sr-only">Search users</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input id="search-users" name="search" autoComplete="off"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search name, email…"
            className="pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none w-full sm:w-64 transition-all text-slate-700"
            style={inpS} onFocus={focusOn} onBlur={focusOff} />
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
                {data.map((u) => {
                  const isSA = u._id === 'USR00001'
                  return (
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
                        {!isSA && (
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(u)} title="Edit"
                              className="p-1.5 rounded-lg text-slate-400 transition-colors"
                              onMouseEnter={(e) => { e.currentTarget.style.color = P; e.currentTarget.style.background = PB }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteId(u._id)} title="Delete"
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
          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
        </div>
      )}

      {/* ── Create Modal ── */}
      <FormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add User" maxWidth="max-w-md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className={lbl}>Name *</label>
            <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
              value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className={lbl}>Email *</label>
            <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
              type="email" value={createForm.email}
              onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
          <div>
            <label className={lbl}>Phone</label>
            <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
              value={createForm.phone} onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className={lbl}>Role *</label>
            <select className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
              value={createForm.roleId} onChange={(e) => setCreateForm((p) => ({ ...p, roleId: e.target.value }))} required>
              <option value="">Select role…</option>
              {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)}
              className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100"
              style={{ border: '1px solid #E2E8F0' }}>Cancel</button>
            <button type="submit" disabled={creating}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
              {creating && <Loader className="w-4 h-4 animate-spin" />}
              {creating ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* ── Edit Modal ── */}
      <FormModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit User" maxWidth="max-w-md">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className={lbl}>Name</label>
            <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
              value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className={lbl}>Phone</label>
            <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
              value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className={lbl}>Role</label>
            {isSuperadminEdit ? (
              <input className={inp} style={inpLocked} value="Superadmin" readOnly />
            ) : (
              <select className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                value={editForm.roleId} onChange={(e) => setEditForm((p) => ({ ...p, roleId: e.target.value }))}>
                <option value="">Select role…</option>
                {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className={lbl}>Status</label>
            {isSuperadminEdit ? (
              <input className={inp} style={inpLocked} value="Active (locked)" readOnly />
            ) : (
              <select className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                value={editForm.active ? 'true' : 'false'}
                onChange={(e) => setEditForm((p) => ({ ...p, active: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            )}
          </div>
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

      <ConfirmModal isOpen={!!deleteId} title="Delete User"
        message="This will permanently delete this user and their Firebase account."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />

      {/* ── Success Modal (Backup Link) ── */}
      <FormModal isOpen={!!successLink} onClose={() => { setSuccessLink(''); setCreateOpen(false) }} title="User Created Successfully" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-green-50 border border-green-100">
            <p className="text-sm text-green-800">
              An automated setup email has been triggered. If the user doesn't receive it, you can share this manual setup link:
            </p>
          </div>
          <div className="relative">
            <input readOnly value={successLink} className={inp} style={inpLocked} />
            <button
              onClick={() => { navigator.clipboard.writeText(successLink); toast.success('Link copied!') }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-bold rounded-lg transition-all"
              style={{ background: PL, color: P }}>
              COPY
            </button>
          </div>
          <button onClick={() => { setSuccessLink(''); setCreateOpen(false) }}
            className="w-full py-2.5 text-white font-semibold text-sm rounded-lg"
            style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
            Done
          </button>
        </div>
      </FormModal>
    </div>
  )
}
