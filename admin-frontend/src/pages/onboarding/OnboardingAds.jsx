import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adsApi } from '../../services/api'
import toast from 'react-hot-toast'
import { LayoutGrid, ArrowRight, SkipForward } from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'

export default function OnboardingAds() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ publisherId: '', autoAdsEnabled: false })

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adsApi.connectAdsense(form)
      toast.success('Google AdSense connected!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connect failed')
    } finally { setSaving(false) }
  }

  const skip = () => navigate('/dashboard')

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
                  style={{ background: P, color: '#FFFFFF' }}>
                  {n}
                </div>
                <span className="text-xs font-medium" style={{ color: P }}>{label}</span>
              </div>
              {n < 3 && <div className="w-8 h-px" style={{ background: P }} />}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg,#4285F4,#34A853)', boxShadow: '0 8px 24px rgba(66,133,244,0.3)' }}>
            <LayoutGrid className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Google AdSense</h1>
          <p className="text-sm text-slate-500 mt-1">Connect AdSense to display Google ads automatically</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: `1px solid ${PL}`, boxShadow: '0 8px 32px rgba(10,61,149,0.1)' }}>
          <div className="mb-4 p-3 rounded-xl text-xs text-slate-600 bg-slate-50" style={{ border: '1px solid #E2E8F0' }}>
            <strong>Note:</strong> If you skip this step, you can add ads manually from the Ads page. Once connected, manual ads are disabled and Google manages ad placement. You can connect later from Ads → Settings.
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Publisher ID *</label>
              <input className={inpClass} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
                value={form.publisherId} onChange={set('publisherId')}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX" required />
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input type="checkbox" className="sr-only"
                  checked={form.autoAdsEnabled}
                  onChange={(e) => setForm((p) => ({ ...p, autoAdsEnabled: e.target.checked }))} />
                <div className="w-10 h-6 rounded-full transition-all"
                  style={{ background: form.autoAdsEnabled ? P : '#CBD5E1' }}>
                  <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all"
                    style={{ left: form.autoAdsEnabled ? '22px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
              <span className="text-sm font-medium text-slate-700">Enable Auto Ads</span>
            </label>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={skip}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-500 transition-all"
                style={{ border: '1px solid #E2E8F0' }}>
                <SkipForward className="w-4 h-4" /> Skip
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#4285F4,#34A853)', boxShadow: '0 4px 14px rgba(66,133,244,0.35)' }}>
                {saving ? 'Connecting…' : <><span>Connect & Finish</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
