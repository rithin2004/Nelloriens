import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersApi, rolesApi } from '../../services/api'
import PageHeader from '../../components/common/PageHeader'
import toast from 'react-hot-toast'
import { Copy, Check, ArrowLeft } from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'

export default function UsersCreate() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [roles, setRoles] = useState([])
  const [resetLink, setResetLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', roleId: '' })

  useEffect(() => {
    rolesApi.getAll({ limit: 100 })
      .then((r) => setRoles(r.data.items || []))
      .catch(() => {})
  }, [])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.roleId) { toast.error('Role is required'); return }
    setSaving(true)
    try {
      const r = await usersApi.create(form)
      setResetLink(r.data.resetLink)
      toast.success('User created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed')
    } finally { setSaving(false) }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(resetLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inpClass = 'w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-all text-slate-700'
  const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
  const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
  const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Create User" subtitle="New admin user — password set via email link" />

      <div className="max-w-lg">
        <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: `1px solid ${PL}` }}>
          {!resetLink ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Name *</label>
                <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email *</label>
                <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  type="email" value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
                <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Role *</label>
                <select className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  value={form.roleId} onChange={set('roleId')} required>
                  <option value="">Select role…</option>
                  {roles.filter((r) => r._id !== 'ROL00001').map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => navigate('/users/list')}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600"
                  style={{ border: '1px solid #E2E8F0' }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
                  {saving ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-slate-800">User created!</h3>
                <p className="text-sm text-slate-500 mt-1">Share this password reset link with the user.</p>
              </div>
              <div className="p-3 rounded-xl text-xs font-mono break-all"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                {resetLink}
              </div>
              <div className="flex gap-2">
                <button onClick={copyLink}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all"
                  style={{ background: copied ? '#DCFCE7' : PL, color: copied ? '#15803D' : P }}>
                  {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                </button>
                <button onClick={() => navigate('/users/list')}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl"
                  style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
