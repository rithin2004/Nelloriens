import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usersApi, rolesApi } from '../../services/api'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'

export default function UsersEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', roleId: '', active: true })

  useEffect(() => {
    Promise.all([
      usersApi.getById(id),
      rolesApi.getAll({ limit: 100 }),
    ]).then(([uRes, rRes]) => {
      const u = uRes.data
      setForm({ name: u.name || '', phone: u.phone || '', roleId: u.roleId || '', active: u.active !== false })
      setRoles(rRes.data.items || [])
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await usersApi.update(id, { ...form, active: form.active === true || form.active === 'true' })
      toast.success('User updated')
      navigate('/users/list')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  const inpClass = 'w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-all text-slate-700'
  const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
  const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
  const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

  if (loading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in">
      <PageHeader title="Edit User" subtitle={id} />
      <div className="max-w-lg">
        <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: `1px solid ${PL}` }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Name</label>
              <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
              <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Role</label>
              <select className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                value={form.roleId} onChange={set('roleId')}>
                <option value="">Select role…</option>
                {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
              <select className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                value={form.active ? 'true' : 'false'}
                onChange={(e) => setForm((p) => ({ ...p, active: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/users/list')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600"
                style={{ border: '1px solid #E2E8F0' }}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
