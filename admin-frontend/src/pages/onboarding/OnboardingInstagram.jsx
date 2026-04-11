import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { instagramApi } from '../../services/api'
import toast from 'react-hot-toast'
import { Camera, ArrowRight, SkipForward } from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'

export default function OnboardingInstagram() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ accessToken: '', username: '' })

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await instagramApi.connect(form)
      toast.success('Instagram connected!')
      navigate('/onboarding/ads')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connect failed')
    } finally { setSaving(false) }
  }

  const skip = () => navigate('/onboarding/ads')

  const inpClass = 'w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none transition-all text-slate-700'
  const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
  const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
  const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 100%)' }}>
      <div className="w-full max-w-md">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[{ n: 1, label: 'Company' }, { n: 2, label: 'Instagram' }, { n: 3, label: 'Ads' }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: n <= 2 ? P : '#E2E8F0', color: n <= 2 ? '#FFFFFF' : '#94A3B8' }}>
                  {n}
                </div>
                <span className="text-xs font-medium" style={{ color: n <= 2 ? P : '#94A3B8' }}>{label}</span>
              </div>
              {n < 3 && <div className="w-8 h-px" style={{ background: n < 2 ? P : '#E2E8F0' }} />}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg,#E1306C,#833AB4)', boxShadow: '0 8px 24px rgba(225,48,108,0.3)' }}>
            <Camera className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Instagram Setup</h1>
          <p className="text-sm text-slate-500 mt-1">Connect your Instagram account to sync posts automatically</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: `1px solid ${PL}`, boxShadow: '0 8px 32px rgba(10,61,149,0.1)' }}>
          <div className="mb-4 p-3 rounded-xl text-xs text-slate-600 bg-slate-50" style={{ border: '1px solid #E2E8F0' }}>
            <strong>Note:</strong> If you skip this step, you can manually add Instagram post previews from the Instagram page. You can connect later from Instagram → Settings.
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Access Token *</label>
              <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                value={form.accessToken} onChange={set('accessToken')} placeholder="Instagram Graph API access token" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Username</label>
              <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                value={form.username} onChange={set('username')} placeholder="@yourhandle" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={skip}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-500 transition-all"
                style={{ border: '1px solid #E2E8F0' }}>
                <SkipForward className="w-4 h-4" /> Skip
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#E1306C,#833AB4)', boxShadow: '0 4px 14px rgba(225,48,108,0.35)' }}>
                {saving ? 'Connecting…' : <><span>Connect & Continue</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
