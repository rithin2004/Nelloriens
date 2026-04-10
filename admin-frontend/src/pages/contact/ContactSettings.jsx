import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Mail, Phone, MapPin, Building2,
  Pencil, X, Check, Loader, Globe,
} from 'lucide-react'
import {
  InstagramIcon, YoutubeIcon, FacebookIcon, TwitterXIcon,
  LinkedInIcon, WhatsAppIcon, TelegramIcon,
} from '../../components/common/SocialIcon'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { contactApi } from '../../services/api'

const inp = 'w-full pl-9 pr-3 py-2.5 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
const focusOn  = (e) => { e.target.style.borderColor = '#0a3d95'; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const focusOff = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }
const lbl = 'block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500'
const card = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }

const socialLinks = [
  { key: 'instagram', label: 'Instagram',   Icon: InstagramIcon, color: '#E1306C' },
  { key: 'youtube',   label: 'YouTube',     Icon: YoutubeIcon,   color: '#FF0000' },
  { key: 'facebook',  label: 'Facebook',    Icon: FacebookIcon,  color: '#1877F2' },
  { key: 'twitter',   label: 'Twitter / X', Icon: TwitterXIcon,  color: '#1DA1F2' },
  { key: 'linkedin',  label: 'LinkedIn',    Icon: LinkedInIcon,  color: '#0A66C2' },
  { key: 'whatsapp',  label: 'WhatsApp',    Icon: WhatsAppIcon,  color: '#25D366' },
  { key: 'telegram',  label: 'Telegram',    Icon: TelegramIcon,  color: '#2AABEE' },
  { key: 'website',   label: 'Website',     Icon: Globe,         color: '#7C3AED' },
]

function InfoRow({ icon: Icon, iconColor, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid #F8FAFC' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#eef3fd' }}>
        <Icon className="w-3.5 h-3.5" style={{ color: iconColor || '#64748B' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider mb-0.5 text-slate-400">{label}</p>
        <p className="text-sm text-slate-700 wrap-break-word">{value || <span className="text-slate-300">—</span>}</p>
      </div>
    </div>
  )
}

function EditPopup({ settings, onClose, onSaved }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: settings })

  const onSubmit = async (data) => {
    if (data.pincode && !/^\d{6}$/.test(data.pincode)) {
      toast.error('Pincode must be exactly 6 digits')
      return
    }
    try {
      await contactApi.updateSettings(data)
      toast.success('Settings saved!')
      onSaved()
      onClose()
    } catch (e) {
      toast.error(e?.message || 'Save failed')
    }
  }

  function FieldRow({ icon: Icon, iconColor, label, children }) {
    return (
      <div>
        <label className={lbl}>{label}</label>
        <div className="relative">
          <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: iconColor || '#94A3B8' }} />
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl animate-slide-up overflow-hidden"
        style={{ background: '#FFFFFF', border: '1px solid #dce8fb', boxShadow: '0 24px 64px rgba(10,61,149,0.15)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid #dce8fb', background: '#eef3fd' }}>
          <h3 className="font-bold text-slate-800">Edit Contact Info</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form id="contact-edit-form" onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Basic Info</h4>

              <FieldRow icon={Building2} iconColor="#7C3AED" label="Company Name">
                <input id="ce-company" name="label" autoComplete="organization"
                  {...register('label')} placeholder="e.g. Nelloriens Media"
                  className={inp} style={inpStyle} onFocus={focusOn} onBlur={focusOff} />
              </FieldRow>

              <FieldRow icon={Mail} iconColor="#2563EB" label="Email Address">
                <input id="ce-email" name="email" type="email" autoComplete="email"
                  {...register('email')} placeholder="contact@nelloriens.com"
                  className={inp} style={inpStyle} onFocus={focusOn} onBlur={focusOff} />
              </FieldRow>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldRow icon={Phone} iconColor="#16A34A" label="Phone Number">
                  <input id="ce-phone" name="phone" type="tel" autoComplete="tel"
                    {...register('phone')} placeholder="+91 99999 99999"
                    className={inp} style={inpStyle} onFocus={focusOn} onBlur={focusOff} />
                </FieldRow>
                <FieldRow icon={Phone} iconColor="#25D366" label="WhatsApp Number">
                  <input id="ce-whatsapp" name="whatsapp" type="tel" autoComplete="tel"
                    {...register('whatsapp')} placeholder="+91 99999 99999"
                    className={inp} style={inpStyle} onFocus={focusOn} onBlur={focusOff} />
                </FieldRow>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Address</h4>

              <FieldRow icon={MapPin} iconColor="#D97706" label="Street Address">
                <textarea id="ce-address" name="address" autoComplete="street-address"
                  {...register('address')} rows={2} placeholder="Plot / Door No, Street, Area"
                  className={`${inp} resize-none`}
                  style={{ ...inpStyle, paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
                  onFocus={focusOn} onBlur={focusOff} />
              </FieldRow>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="ce-city" className={lbl}>City</label>
                  <input id="ce-city" name="city" autoComplete="address-level2"
                    {...register('city')} placeholder="Nellore"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 focus:outline-none transition-all"
                    style={inpStyle} onFocus={focusOn} onBlur={focusOff} />
                </div>
                <div>
                  <label htmlFor="ce-state" className={lbl}>State</label>
                  <input id="ce-state" name="state" autoComplete="address-level1"
                    {...register('state')} placeholder="Andhra Pradesh"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 focus:outline-none transition-all"
                    style={inpStyle} onFocus={focusOn} onBlur={focusOff} />
                </div>
                <div>
                  <label htmlFor="ce-pincode" className={lbl}>Pincode</label>
                  <input id="ce-pincode" name="pincode" type="text" inputMode="numeric"
                    autoComplete="postal-code" maxLength={6}
                    {...register('pincode', { pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' } })}
                    placeholder="524001"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 focus:outline-none transition-all"
                    style={inpStyle} onFocus={focusOn} onBlur={focusOff} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Social & External Links</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {socialLinks.map(({ key, label, Icon, color }) => (
                  <div key={key}>
                    <label htmlFor={`ce-${key}`} className={lbl}>{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color }} />
                      <input id={`ce-${key}`} name={key} type="url" autoComplete="url"
                        {...register(key)} placeholder="https://"
                        className={inp} style={inpStyle} onFocus={focusOn} onBlur={focusOff} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="px-5 py-4 shrink-0 flex justify-end gap-3"
          style={{ borderTop: '1px solid #dce8fb', background: '#eef3fd' }}>
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            style={{ border: '1px solid #E2E8F0' }}>
            Cancel
          </button>
          <button type="submit" form="contact-edit-form" disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-sm text-white font-semibold rounded-lg transition-all disabled:opacity-50"
            style={{ background: `linear-gradient(135deg,#0a3d95,#072d6e)`, boxShadow: '0 4px 16px rgba(10,61,149,0.25)' }}>
            {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContactSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const load = () => {
    setLoading(true)
    contactApi.getSettings()
      .then((r) => setSettings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return <LoadingSpinner />

  const s = settings || {}
  const fullAddress = [s.address, s.city, s.state, s.pincode].filter(Boolean).join(', ') || null

  return (
    <div className="max-w-2xl animate-fade-in space-y-5">
      <PageHeader
        title="Contact Settings"
        action={
          <button onClick={() => setEditOpen(true)}
            className="btn-shine flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg"
            style={{ background: `linear-gradient(135deg,#0a3d95,#072d6e)`, boxShadow: '0 4px 12px rgba(10,61,149,0.25)' }}>
            <Pencil className="w-4 h-4" /> Edit
          </button>
        }
      />

      <div style={card}>
        <h3 className="font-bold text-slate-700 mb-1 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>Basic Information</h3>
        <InfoRow icon={Building2} iconColor="#7C3AED" label="Company Name"  value={s.label} />
        <InfoRow icon={Mail}      iconColor="#2563EB" label="Email"         value={s.email} />
        <InfoRow icon={Phone}     iconColor="#16A34A" label="Phone"         value={s.phone} />
        <InfoRow icon={Phone}     iconColor="#25D366" label="WhatsApp"      value={s.whatsapp} />
        <InfoRow icon={MapPin}    iconColor="#D97706" label="Address"       value={fullAddress} />
        {(s.city || s.state || s.pincode) && (
          <InfoRow icon={MapPin} iconColor="#D97706" label="City / State / Pincode"
            value={[s.city, s.state, s.pincode].filter(Boolean).join(' · ')} />
        )}
      </div>

      <div style={card}>
        <h3 className="font-bold text-slate-700 mb-1 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>Social & External Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {socialLinks.map(({ key, label, Icon, color }) => (
            <div key={key} className="flex items-center gap-3 py-2.5 px-2 rounded-lg"
              style={{ borderBottom: '1px solid #F8FAFC' }}>
              <Icon className="w-4 h-4 shrink-0" style={{ color }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400">{label}</p>
                {s[key]
                  ? <a href={s[key]} target="_blank" rel="noreferrer"
                      className="text-xs truncate block hover:underline text-sky-600" style={{ maxWidth: '180px' }}>
                      {s[key].replace(/^https?:\/\//, '')}
                    </a>
                  : <p className="text-xs text-slate-300">Not set</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {editOpen && <EditPopup settings={s} onClose={() => setEditOpen(false)} onSaved={load} />}
    </div>
  )
}
