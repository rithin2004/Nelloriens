import { useEffect, useRef, useState } from 'react'
import { companyApi, uploadApi } from '../../services/api'
import PageHeader from '../../components/common/PageHeader'
import FormModal from '../../components/common/FormModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  Building2, Pencil, Phone, Mail, Globe, MapPin,
  Upload, X, Link, MessageCircle,
} from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const SOCIAL_FIELDS = [
  { key: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/...' },
  { key: 'twitter',   label: 'X (Twitter)', placeholder: 'https://x.com/...' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/...' },
  { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/...' },
  { key: 'whatsapp',  label: 'WhatsApp Channel', placeholder: 'https://whatsapp.com/channel/...' },
  { key: 'telegram',  label: 'Telegram',  placeholder: 'https://t.me/...' },
]

const inp = 'w-full px-3 py-2 text-sm rounded-xl focus:outline-none transition-all text-slate-700'
const inpS = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
const focusOn  = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const focusOff = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }
const lbl = 'block text-xs font-semibold uppercase tracking-wide mb-1.5 text-slate-500'
const card = { background: '#FFFFFF', border: `1px solid ${PL}`, borderRadius: '16px', padding: '20px' }

function EmptySection() {
  return (
    <p className="text-xs text-slate-400 italic py-1">No details added yet.</p>
  )
}

function SectionCard({ title, children }) {
  return (
    <div style={card} className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider pb-2" style={{ color: P, borderBottom: `1px solid ${PL}` }}>{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: PB }}>
        <Icon className="w-4 h-4" style={{ color: P }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-medium text-slate-700 break-all">{value}</p>
      </div>
    </div>
  )
}

export default function CompanySettings() {
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [isNew, setIsNew]       = useState(false)
  const [data, setData]         = useState({})
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm]         = useState({})
  const [logoUploading, setLogoUploading] = useState(false)
  const logoRef = useRef(null)

  const fetchData = () => {
    setLoading(true)
    companyApi.get()
      .then((r) => {
        const d = r.data || {}
        setIsNew(!d._exists)
        setData(d)
      })
      .catch(() => { setIsNew(true); setData({}) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const openEdit = () => {
    setForm({ ...data })
    setEditOpen(true)
  }

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  const setSocial = (key) => (e) =>
    setForm((p) => ({ ...p, socialLinks: { ...(p.socialLinks || {}), [key]: e.target.value } }))

  // ── Logo upload ────────────────────────────────────────────────────────────
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2 MB'); return }
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadApi.upload('company', fd)
      const url = res.data?.url
      if (!url) throw new Error('Upload failed')
      setForm((p) => ({ ...p, logoUrl: url }))
      toast.success('Logo uploaded')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setLogoUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name?.trim() || !form.email?.trim() || !form.phone?.trim()) {
      toast.error('Name, email and phone are required')
      return
    }
    setSaving(true)
    try {
      if (isNew) { await companyApi.create(form); setIsNew(false) }
      else        { await companyApi.update(form) }
      toast.success('Company details saved')
      setEditOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner />

  const socialLinks = data.socialLinks || {}
  const hasSocials  = SOCIAL_FIELDS.some(({ key }) => socialLinks[key])

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        title="Company"
        subtitle="Your organisation's public information"
        action={
          <button
            onClick={openEdit}
            className="btn-shine flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg"
            style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 4px 12px rgba(10,61,149,0.25)' }}
          >
            <Pencil className="w-4 h-4" />
            {isNew ? 'Set Up Company' : 'Edit Company'}
          </button>
        }
      />

      {isNew ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: '#FFFFFF', border: `2px dashed ${PL}` }}>
          <Building2 className="w-10 h-10 mx-auto mb-3" style={{ color: PL }} />
          <p className="text-sm font-semibold text-slate-500">No company details yet</p>
          <p className="text-xs text-slate-400 mt-1">Click "Set Up Company" to get started</p>
        </div>
      ) : (
        <>
          {/* Logo + Name banner */}
          <div style={card} className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: PB, border: `2px solid ${PL}` }}
            >
              {data.logoUrl
                ? <img src={data.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                : <Building2 className="w-8 h-8" style={{ color: PL }} />
              }
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{data.name || '—'}</h2>
              {data.tagline && <p className="text-sm text-slate-500 mt-0.5">{data.tagline}</p>}
              {data.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{data.description}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Contact */}
            <SectionCard title="Contact">
              <InfoRow icon={Mail}           label="Contact Email"   value={data.email} />
              <InfoRow icon={Mail}           label="Support Email"   value={data.supportEmail} />
              <InfoRow icon={Phone}          label="Phone"           value={data.phone} />
              <InfoRow icon={MessageCircle}  label="WhatsApp Number" value={data.whatsappNumber} />
              {!data.email && !data.supportEmail && !data.phone && !data.whatsappNumber && <EmptySection />}
            </SectionCard>

            {/* Address */}
            <SectionCard title="Address">
              <InfoRow icon={MapPin} label="Address"  value={data.address} />
              <InfoRow icon={MapPin} label="City"     value={[data.city, data.state, data.pincode].filter(Boolean).join(', ')} />
              <InfoRow icon={MapPin} label="Country"  value={data.country} />
              {!data.address && !data.city && !data.state && !data.pincode && !data.country && <EmptySection />}
            </SectionCard>

            {/* Online */}
            <SectionCard title="Online">
              <InfoRow icon={Globe} label="Website"            value={data.website} />
              <InfoRow icon={Link}  label="Maps Embed URL"     value={data.mapEmbedUrl ? 'Configured' : null} />
              <InfoRow icon={Globe} label="Google Analytics"   value={data.gaId || null} />
              {!data.website && !data.mapEmbedUrl && !data.gaId && <EmptySection />}
            </SectionCard>

            {/* Social Links */}
            <SectionCard title="Social Links">
              {hasSocials ? (
                <div className="space-y-1.5">
                  {SOCIAL_FIELDS.filter(({ key }) => socialLinks[key]).map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500 w-28 shrink-0">{label}</span>
                      <a
                        href={socialLinks[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs truncate hover:underline"
                        style={{ color: P }}
                      >
                        {socialLinks[key]}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection />
              )}
            </SectionCard>
          </div>
        </>
      )}

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <FormModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Company Details" maxWidth="max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">

          {/* Logo */}
          <div>
            <p className={lbl}>Company Logo</p>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative"
                style={{ background: PB, border: `2px dashed ${PL}` }}
              >
                {form.logoUrl
                  ? <>
                      <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, logoUrl: '' }))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  : <Building2 className="w-8 h-8" style={{ color: PL }} />
                }
              </div>
              <div className="space-y-1.5">
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  disabled={logoUploading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg disabled:opacity-50"
                  style={{ background: PB, border: `1px solid ${PL}`, color: P }}
                >
                  <Upload className="w-4 h-4" />
                  {logoUploading ? 'Uploading…' : form.logoUrl ? 'Change Logo' : 'Upload Logo'}
                </button>
                <p className="text-xs text-slate-400">PNG, SVG or WebP · Max 2 MB</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <p className={lbl} style={{ color: P }}>Basic Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Company Name *</label>
                <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                  value={form.name || ''} onChange={set('name')} required />
              </div>
              <div>
                <label className={lbl}>Tagline</label>
                <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                  value={form.tagline || ''} onChange={set('tagline')} />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Description</label>
                <textarea className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                  rows={2} value={form.description || ''} onChange={set('description')} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className={lbl} style={{ color: P }}>Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Contact Email *</label>
                <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                  type="email" value={form.email || ''} onChange={set('email')} required />
              </div>
              <div>
                <label className={lbl}>Support Email</label>
                <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                  type="email" value={form.supportEmail || ''} onChange={set('supportEmail')} />
              </div>
              <div>
                <label className={lbl}>Phone Number *</label>
                <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                  value={form.phone || ''} onChange={set('phone')} required />
              </div>
              <div>
                <label className={lbl}>WhatsApp Number</label>
                <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                  placeholder="+91 XXXXX XXXXX" value={form.whatsappNumber || ''} onChange={set('whatsappNumber')} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className={lbl} style={{ color: P }}>Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={lbl}>Street Address</label>
                <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                  value={form.address || ''} onChange={set('address')} />
              </div>
              {['city', 'state', 'pincode', 'country'].map((k) => (
                <div key={k}>
                  <label className={lbl}>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                  <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                    value={form[k] || ''} onChange={set(k)} />
                </div>
              ))}
            </div>
          </div>

          {/* Online */}
          <div>
            <p className={lbl} style={{ color: P }}>Online Presence</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Website URL</label>
                <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                  type="url" value={form.website || ''} onChange={set('website')} />
              </div>
              <div>
                <label className={lbl}>Google Maps Embed URL</label>
                <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                  type="url" value={form.mapEmbedUrl || ''} onChange={set('mapEmbedUrl')} />
              </div>
              <div>
                <label className={lbl}>Google Analytics ID</label>
                <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                  placeholder="G-XXXXXXXXXX" value={form.gaId || ''} onChange={set('gaId')} />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <p className={lbl} style={{ color: P }}>Social Links</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className={lbl}>{label}</label>
                  <input className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
                    type="url" placeholder={placeholder}
                    value={form.socialLinks?.[key] || ''} onChange={setSocial(key)} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2" style={{ borderTop: `1px solid ${PL}` }}>
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-4 py-2.5 text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              style={{ border: '1px solid #E2E8F0' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 4px 14px rgba(10,61,149,0.3)' }}
            >
              {saving ? 'Saving…' : 'Save Company Details'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  )
}
