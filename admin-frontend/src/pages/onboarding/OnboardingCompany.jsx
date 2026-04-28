import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { companyApi } from '../../services/api'
import toast from 'react-hot-toast'
import { Building2, ArrowRight } from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

export default function OnboardingCompany() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [exists, setExists] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', tagline: '', address: '', city: '', website: '' })

  useEffect(() => {
    companyApi.get().then((r) => {
      const data = r.data.data
      if (data?._exists) {
        setExists(true)
        const { _exists, createdAt: _c, updatedAt: _u, ...fields } = data
        setForm((prev) => ({ ...prev, ...fields }))
      }
    }).catch(() => {})
  }, [])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (exists) {
        await companyApi.update(form)
      } else {
        await companyApi.create(form)
      }
      toast.success('Company details saved!')
      navigate('/onboarding/instagram')
    } catch (err) {
      toast.error(err.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const inpClass = 'w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none transition-all text-slate-700'
  const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
  const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
  const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 100%)' }}>
      <div className="w-full max-w-lg">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[{ n: 1, label: 'Company' }, { n: 2, label: 'Instagram' }, { n: 3, label: 'Ads' }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: n === 1 ? P : '#E2E8F0', color: n === 1 ? '#FFFFFF' : '#94A3B8' }}>
                  {n}
                </div>
                <span className="text-xs font-medium" style={{ color: n === 1 ? P : '#94A3B8' }}>{label}</span>
              </div>
              {n < 3 && <div className="w-8 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-3"
            style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 8px 24px rgba(10,61,149,0.3)' }}>
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Company Details</h1>
          <p className="text-sm text-slate-500 mt-1">Tell us about your organisation</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: `1px solid ${PL}`, boxShadow: '0 8px 32px rgba(10,61,149,0.1)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="ob-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Company Name *</label>
                <input id="ob-name" name="name" autoComplete="organization" className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label htmlFor="ob-email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email *</label>
                <input id="ob-email" name="email" autoComplete="email" className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  type="email" value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <label htmlFor="ob-phone" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone *</label>
                <input id="ob-phone" name="phone" autoComplete="tel" className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  value={form.phone} onChange={set('phone')} required />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ob-tagline" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tagline</label>
                <input id="ob-tagline" name="tagline" autoComplete="off" className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  value={form.tagline} onChange={set('tagline')} placeholder="Your brand tagline…" />
              </div>
              <div>
                <label htmlFor="ob-city" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">City</label>
                <input id="ob-city" name="city" autoComplete="address-level2" className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  value={form.city} onChange={set('city')} />
              </div>
              <div>
                <label htmlFor="ob-website" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Website</label>
                <input id="ob-website" name="website" autoComplete="url" className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                  type="url" value={form.website} onChange={set('website')} />
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 mt-2"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 4px 14px rgba(10,61,149,0.4)' }}>
              {saving ? 'Saving…' : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
