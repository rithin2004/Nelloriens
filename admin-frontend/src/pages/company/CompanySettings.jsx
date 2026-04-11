import { useEffect, useState } from 'react'
import { companyApi } from '../../services/api'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Building2, Save } from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const FIELDS = [
  { key: 'name',        label: 'Company Name',  required: true },
  { key: 'email',       label: 'Email',         required: true, type: 'email' },
  { key: 'phone',       label: 'Phone',         required: true },
  { key: 'tagline',     label: 'Tagline' },
  { key: 'description', label: 'Description',   type: 'textarea' },
  { key: 'address',     label: 'Address' },
  { key: 'city',        label: 'City' },
  { key: 'state',       label: 'State' },
  { key: 'pincode',     label: 'Pincode' },
  { key: 'country',     label: 'Country' },
  { key: 'website',     label: 'Website', type: 'url' },
  { key: 'logoUrl',     label: 'Logo URL', type: 'url' },
  { key: 'faviconUrl',  label: 'Favicon URL', type: 'url' },
  { key: 'mapEmbedUrl', label: 'Google Maps Embed URL', type: 'url' },
]

const SOCIAL_FIELDS = ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin', 'whatsapp']

export default function CompanySettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    companyApi.get()
      .then((r) => {
        const d = r.data || {}
        setIsNew(!d._exists)
        setForm(d)
      })
      .catch(() => { setIsNew(true); setForm({}) })
      .finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  const setSocial = (key) => (e) => setForm((p) => ({ ...p, socialLinks: { ...(p.socialLinks || {}), [key]: e.target.value } }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) { toast.error('Name, email and phone are required'); return }
    setSaving(true)
    try {
      if (isNew) { await companyApi.create(form); setIsNew(false) }
      else        { await companyApi.update(form) }
      toast.success('Company details saved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const inpClass = 'w-full px-3 py-2 text-sm rounded-xl focus:outline-none transition-all text-slate-700'
  const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
  const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
  const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

  if (loading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Company Details"
        subtitle="Your organisation's public information"
        icon={<Building2 className="w-5 h-5" style={{ color: P }} />}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: `1px solid ${PL}` }}>
          <h3 className="text-sm font-bold text-slate-700 mb-4 pb-3" style={{ borderBottom: `1px solid ${PL}` }}>Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.filter(f => !['description','address','city','state','pincode','country','website','logoUrl','faviconUrl','mapEmbedUrl'].includes(f.key)).map(({ key, label, required, type }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {label} {required && <span className="text-red-400">*</span>}
                </label>
                <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  type={type || 'text'} value={form[key] || ''} onChange={set(key)} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
            <textarea className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
              rows={3} value={form.description || ''} onChange={set('description')} />
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: `1px solid ${PL}` }}>
          <h3 className="text-sm font-bold text-slate-700 mb-4 pb-3" style={{ borderBottom: `1px solid ${PL}` }}>Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['address','city','state','pincode','country'].map((key) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  value={form[key] || ''} onChange={set(key)} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: `1px solid ${PL}` }}>
          <h3 className="text-sm font-bold text-slate-700 mb-4 pb-3" style={{ borderBottom: `1px solid ${PL}` }}>Online Presence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['website','logoUrl','faviconUrl','mapEmbedUrl'].map((key) => {
              const labels = { website:'Website URL', logoUrl:'Logo URL', faviconUrl:'Favicon URL', mapEmbedUrl:'Google Maps Embed URL' }
              return (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{labels[key]}</label>
                  <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                    type="url" value={form[key] || ''} onChange={set(key)} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: `1px solid ${PL}` }}>
          <h3 className="text-sm font-bold text-slate-700 mb-4 pb-3" style={{ borderBottom: `1px solid ${PL}` }}>Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOCIAL_FIELDS.map((key) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  type="url" placeholder={`https://${key}.com/...`}
                  value={form.socialLinks?.[key] || ''} onChange={setSocial(key)} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
            style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 4px 14px rgba(10,61,149,0.3)' }}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Company Details'}
          </button>
        </div>
      </form>
    </div>
  )
}
