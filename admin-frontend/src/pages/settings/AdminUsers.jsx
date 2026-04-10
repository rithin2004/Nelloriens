import { useEffect, useState } from 'react'
import {
  Plus, Trash2, Shield, ShieldCheck, ChevronDown, ChevronUp,
  Users, Lock, Check, X, Loader,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import ConfirmModal from '../../components/common/ConfirmModal'
import { settingsApi } from '../../services/api'

/* ── Constants ─────────────────────────────────────────────────────────────── */
const MAX_USERS = 10

const MODULES = [
  { key: 'news',         label: 'News'           },
  { key: 'jobs',         label: 'Jobs'           },
  { key: 'updates',      label: 'Updates'        },
  { key: 'events',       label: 'Events'         },
  { key: 'results',      label: 'Results'        },
  { key: 'sports',       label: 'Sports'         },
  { key: 'tourism',      label: 'Tourism'        },
  { key: 'transport',    label: 'Transport'      },
  { key: 'offers',       label: 'Offers'         },
  { key: 'foods',        label: 'Foods'          },
  { key: 'history',      label: 'History'        },
  { key: 'movies',       label: 'Movies'         },
  { key: 'stays',        label: 'Stays'          },
  { key: 'breaking',     label: 'Breaking News'  },
  { key: 'contact',      label: 'Contact'        },
  { key: 'leads',        label: 'Leads'          },
  { key: 'ads',          label: 'Ads'            },
  { key: 'sponsorships', label: 'Sponsorships'   },
  { key: 'instagram',    label: 'Instagram'      },
]

const CRUD_OPS = [
  { key: 'create', label: 'C', title: 'Create' },
  { key: 'read',   label: 'R', title: 'Read'   },
  { key: 'update', label: 'U', title: 'Update' },
  { key: 'delete', label: 'D', title: 'Delete' },
]

// Default permissions for a new user — read-only on all modules
function defaultPermissions() {
  const perms = {}
  MODULES.forEach(({ key }) => {
    perms[key] = { create: false, read: true, update: false, delete: false }
  })
  return perms
}

// Full access (super_admin)
function fullPermissions() {
  const perms = {}
  MODULES.forEach(({ key }) => {
    perms[key] = { create: true, read: true, update: true, delete: true }
  })
  return perms
}

/* ── Permission Grid ────────────────────────────────────────────────────────── */
function PermissionGrid({ permissions, onChange, locked }) {
  const toggleAll = (moduleKey) => {
    if (locked) return
    const cur = permissions[moduleKey] || {}
    const allOn = CRUD_OPS.every((op) => cur[op.key])
    const next = {}
    CRUD_OPS.forEach((op) => { next[op.key] = !allOn })
    onChange(moduleKey, next)
  }

  const toggle = (moduleKey, opKey) => {
    if (locked) return
    const cur = permissions[moduleKey] || {}
    onChange(moduleKey, { ...cur, [opKey]: !cur[opKey] })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Module</th>
            {CRUD_OPS.map((op) => (
              <th key={op.key} className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-14" title={op.title}>
                {op.label}
              </th>
            ))}
            <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">All</th>
          </tr>
        </thead>
        <tbody>
          {MODULES.map(({ key, label }, idx) => {
            const perms = permissions[key] || {}
            const allOn = CRUD_OPS.every((op) => perms[op.key])
            return (
              <tr key={key} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                <td className="px-4 py-2.5 font-medium text-slate-700">{label}</td>
                {CRUD_OPS.map((op) => (
                  <td key={op.key} className="px-3 py-2.5 text-center">
                    {locked ? (
                      <Check className="w-4 h-4 mx-auto text-green-500" />
                    ) : (
                      <button
                        onClick={() => toggle(key, op.key)}
                        className="w-5 h-5 rounded flex items-center justify-center mx-auto transition-all border"
                        style={perms[op.key]
                          ? { background: '#0a3d95', borderColor: '#0a3d95' }
                          : { background: '#FFFFFF', borderColor: '#CBD5E1' }}>
                        {perms[op.key] && <Check className="w-3 h-3 text-white" />}
                      </button>
                    )}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-center">
                  {locked ? (
                    <Check className="w-4 h-4 mx-auto text-green-500" />
                  ) : (
                    <button
                      onClick={() => toggleAll(key)}
                      className="w-5 h-5 rounded flex items-center justify-center mx-auto transition-all border"
                      style={allOn
                        ? { background: '#8B5CF6', borderColor: '#8B5CF6' }
                        : { background: '#FFFFFF', borderColor: '#CBD5E1' }}>
                      {allOn && <Check className="w-3 h-3 text-white" />}
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ── User Row ───────────────────────────────────────────────────────────────── */
function UserRow({ user, isSuperAdmin, onDelete, onSavePermissions }) {
  const [expanded, setExpanded] = useState(false)
  const [permissions, setPermissions] = useState(user.permissions || defaultPermissions())
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const handleChange = (moduleKey, ops) => {
    setPermissions((prev) => ({ ...prev, [moduleKey]: ops }))
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSavePermissions(user._id, permissions)
      toast.success('Permissions saved!')
      setDirty(false)
    } catch {
      toast.error('Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  const displayPerms = isSuperAdmin ? fullPermissions() : permissions

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors"
        style={{ background: '#FFFFFF' }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
        onClick={() => setExpanded((p) => !p)}>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: isSuperAdmin ? 'linear-gradient(135deg,#F59E0B,#EF4444)' : 'linear-gradient(135deg,#0a3d95,#6366F1)' }}>
          {user.email?.[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm truncate">{user.email}</span>
            {isSuperAdmin && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#FEF3C7', color: '#B45309' }}>
                <ShieldCheck className="w-3 h-3" /> Super Admin
              </span>
            )}
            {!isSuperAdmin && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
            {user.active === false && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#FEE2E2', color: '#DC2626' }}>Inactive</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isSuperAdmin ? 'Full access to all modules' : 'Click to manage permissions'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isSuperAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(user._id, user.email) }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
              onMouseEnter={(e) => { e.stopPropagation(); e.currentTarget.style.background = '#FEE2E2' }}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              title="Remove user">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Permission grid */}
      {expanded && (
        <div style={{ borderTop: '1px solid #E2E8F0' }}>
          <PermissionGrid
            permissions={displayPerms}
            onChange={handleChange}
            locked={isSuperAdmin}
          />
          {!isSuperAdmin && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #F1F5F9', background: '#FAFAFA' }}>
              <p className="text-xs text-slate-400">C=Create · R=Read · U=Update · D=Delete</p>
              <button
                onClick={handleSave}
                disabled={!dirty || saving}
                className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}>
                {saving ? <><Loader className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Check className="w-3.5 h-3.5" /> Save Permissions</>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Add User Panel ─────────────────────────────────────────────────────────── */
function AddUserPanel({ onAdd, onCancel, saving }) {
  const [email, setEmail]   = useState('')
  const [name, setName]     = useState('')

  const inp = 'w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-all'
  const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
  const focus = (e) => { e.target.style.borderColor = '#0a3d95'; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
  const blur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    onAdd({ email: email.trim(), name: name.trim(), role: 'admin', permissions: defaultPermissions() })
  }

  return (
    <form onSubmit={submit} className="rounded-xl p-4 space-y-3 animate-slide-up"
      style={{ background: '#eef3fd', border: '1px solid #dce8fb' }}>
      <h3 className="font-semibold text-slate-800 text-sm">Add New User</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className={inp} style={inpStyle} onFocus={focus} onBlur={blur} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Display Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Full name (optional)"
            className={inp} style={inpStyle} onFocus={focus} onBlur={blur} />
        </div>
      </div>
      <p className="text-xs text-slate-500">User will be added as <strong>Admin</strong>. You can configure their module permissions after adding.</p>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 rounded-lg transition-colors hover:bg-white"
          style={{ border: '1px solid #CBD5E1' }}>
          <X className="w-4 h-4" /> Cancel
        </button>
        <button type="submit" disabled={!email.trim() || saving}
          className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}>
          {saving ? <><Loader className="w-4 h-4 animate-spin" /> Adding…</> : <><Plus className="w-4 h-4" /> Add User</>}
        </button>
      </div>
    </form>
  )
}

/* ── Main Page ──────────────────────────────────────────────────────────────── */
export default function AdminUsers() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [addSaving, setAddSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, email }
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = () => {
    setLoading(true)
    settingsApi.getAdmins()
      .then((r) => setUsers(r.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleAdd = async (data) => {
    setAddSaving(true)
    try {
      await settingsApi.createAdmin(data)
      toast.success('User added!')
      setShowAdd(false)
      fetchUsers()
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Failed to add user')
    } finally {
      setAddSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await settingsApi.deleteAdmin(deleteTarget.id)
      toast.success('User removed')
      setDeleteTarget(null)
      fetchUsers()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to remove user')
    } finally {
      setDeleting(false)
    }
  }

  const handleSavePermissions = (id, permissions) =>
    settingsApi.updateAdmin(id, { permissions })

  const superAdmins = users.filter((u) => u.role === 'super_admin')
  const admins      = users.filter((u) => u.role !== 'super_admin')
  const total       = users.length
  const canAddMore  = total < MAX_USERS

  return (
    <div className="max-w-4xl animate-fade-in">
      <PageHeader
        title="Users & Permissions"
        backTo="/settings"
        action={
          !showAdd && canAddMore && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
              <Plus className="w-4 h-4" /> Add User
            </button>
          )
        }
      />

      {/* Capacity bar */}
      <div className="mb-5 rounded-xl p-4 flex items-center gap-4" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EDE9FE' }}>
          <Users className="w-5 h-5" style={{ color: '#7C3AED' }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-700">{total} / {MAX_USERS} users</span>
            {!canAddMore && <span className="text-xs font-medium" style={{ color: '#DC2626' }}>Limit reached</span>}
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${(total / MAX_USERS) * 100}%`,
              background: total >= MAX_USERS ? '#EF4444' : total >= 8 ? '#F59E0B' : 'linear-gradient(90deg,#0a3d95,#8B5CF6)',
            }} />
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-slate-400">{MAX_USERS - total} slot{MAX_USERS - total !== 1 ? 's' : ''} free</span>
        </div>
      </div>

      {/* Add user form */}
      {showAdd && (
        <div className="mb-5">
          <AddUserPanel onAdd={handleAdd} onCancel={() => setShowAdd(false)} saving={addSaving} />
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-slate-500"><Lock className="w-3 h-3" /> Click a row to expand permissions</div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-3 h-3 rounded inline-block" style={{ background: '#0a3d95' }} />
          <span className="text-slate-500">Allowed</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-3 h-3 rounded border inline-block" style={{ borderColor: '#CBD5E1' }} />
          <span className="text-slate-500">Denied</span>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid #dce8fb', borderTopColor: '#0a3d95' }} />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Super admins first */}
          {superAdmins.map((u) => (
            <UserRow
              key={u._id}
              user={u}
              isSuperAdmin
              onDelete={(id, email) => setDeleteTarget({ id, email })}
              onSavePermissions={handleSavePermissions}
            />
          ))}
          {/* Regular admins */}
          {admins.map((u) => (
            <UserRow
              key={u._id}
              user={u}
              isSuperAdmin={false}
              onDelete={(id, email) => setDeleteTarget({ id, email })}
              onSavePermissions={handleSavePermissions}
            />
          ))}
          {users.length === 0 && (
            <div className="py-16 text-center rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-400 text-sm">No users yet. Add users to get started.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Remove User"
        message={`Remove ${deleteTarget?.email} from the admin panel? They will lose all access immediately.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
