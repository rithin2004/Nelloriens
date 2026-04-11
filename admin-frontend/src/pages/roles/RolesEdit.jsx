import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { rolesApi } from '../../services/api'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import PermissionsEditor from './PermissionsEditor'

const P  = '#0a3d95'
const PL = '#dce8fb'

export default function RolesEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [permissions, setPermissions] = useState({})
  const isSuperadmin = id === 'ROL00001'

  useEffect(() => {
    rolesApi.getById(id)
      .then((r) => {
        const role = r.data
        setName(role.name || '')
        setPermissions(role.permissions || {})
      })
      .catch(() => toast.error('Failed to load role'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await rolesApi.update(id, { name: name.trim(), permissions })
      toast.success('Role updated')
      navigate('/roles/list')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  const inpClass = 'w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-all text-slate-700'
  const inpStyle = { background: isSuperadmin ? '#F8FAFC' : '#FFFFFF', border: '1px solid #CBD5E1' }
  const inpFocus = (e) => { if (!isSuperadmin) { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' } }
  const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

  if (loading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in">
      <PageHeader title="Edit Role" subtitle={id} />
      {isSuperadmin && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm text-amber-700 bg-amber-50" style={{ border: '1px solid #FDE68A' }}>
          The superadmin role bypasses all permission checks — permissions are not used.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="max-w-sm rounded-2xl p-6" style={{ background: '#FFFFFF', border: `1px solid ${PL}` }}>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Role Name</label>
          <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
            value={name} onChange={(e) => setName(e.target.value)} readOnly={isSuperadmin} />
        </div>
        {!isSuperadmin && <PermissionsEditor permissions={permissions} onChange={setPermissions} />}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/roles/list')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600"
            style={{ border: '1px solid #E2E8F0' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {!isSuperadmin && (
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
