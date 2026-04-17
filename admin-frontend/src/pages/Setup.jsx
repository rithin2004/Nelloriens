import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setupApi } from '../services/api'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../utils/firebase'
import { Shield, Check, Eye, EyeOff, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

export default function Setup() {
  const navigate = useNavigate()
  const [step,       setStep]       = useState('form')  // 'form' | 'success'
  const [loading,    setLoading]    = useState(false)
  const [checking,   setChecking]   = useState(true)    // checking setup status on mount
  const [showSecret, setShowSecret] = useState(false)
  const [createdEmail, setCreatedEmail] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', secret: '' })

  // RULE 18/19 — redirect to login if Superadmin already exists
  useEffect(() => {
    setupApi.getStatus()
      .then((r) => {
        if (r.data?.initialized) {
          navigate('/login', { replace: true })
        }
      })
      .catch(() => { /* network error — show setup form anyway */ })
      .finally(() => setChecking(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.secret) {
      toast.error('Name, email and secret are required')
      return
    }
    setLoading(true)
    try {
      await setupApi.createSuperadmin(form)
      // Send password-set email via Firebase client SDK (uses Firebase's own template)
      await sendPasswordResetEmail(auth, form.email.trim())
      setCreatedEmail(form.email.trim())
      setStep('success')
      toast.success('Superadmin created!')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    className: 'w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none transition-all text-slate-700',
    style: { background: '#FFFFFF', border: '1px solid #CBD5E1' },
    onFocus: (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' },
    onBlur:  (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' },
  }

  if (checking) return <LoadingSpinner fullScreen />

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-4"
            style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 8px 24px rgba(10,61,149,0.3)' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Initial Setup</h1>
          <p className="text-sm text-slate-500 mt-1">Create the superadmin account to get started</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: '#FFFFFF', border: `1px solid ${PL}`, boxShadow: '0 8px 32px rgba(10,61,149,0.1)' }}>
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Name *</label>
                <input {...inp} placeholder="Full name" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email *</label>
                <input {...inp} type="email" placeholder="admin@example.com" value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
                <input {...inp} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Setup Secret *</label>
                <div className="relative">
                  <input {...inp} type={showSecret ? 'text' : 'password'}
                    placeholder="Enter the SETUP_SECRET from .env"
                    value={form.secret} onChange={set('secret')} required
                    className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl focus:outline-none transition-all text-slate-700" />
                  <button type="button" onClick={() => setShowSecret(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 mt-2"
                style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 4px 14px rgba(10,61,149,0.4)' }}>
                {loading ? 'Creating…' : 'Create Superadmin'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="font-bold text-slate-800">Check your inbox!</h2>
                <p className="text-sm text-slate-500 mt-1">
                  A password-set link has been sent to
                </p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{createdEmail}</p>
              </div>
              <div className="p-3 rounded-xl text-xs text-slate-600" style={{ background: PB, border: `1px solid ${PL}` }}>
                <strong>Didn't receive it?</strong> Check your spam / junk folder. The link expires after 1 hour.
              </div>
              <button onClick={() => navigate('/login')}
                className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
                style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
