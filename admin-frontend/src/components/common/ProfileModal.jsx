import { useEffect, useRef, useState } from 'react'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, RecaptchaVerifier, PhoneAuthProvider, updatePhoneNumber } from 'firebase/auth'
import { auth } from '../../utils/firebase'
import { useAuth } from '../../hooks/useAuth'
import { X, User, Lock, Smartphone, Eye, EyeOff, Check, Loader, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const inp = 'w-full px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all'
const inpStyle = { background: '#0F172A', border: '1px solid #334155' }
const lbl = 'block text-xs font-semibold uppercase tracking-wider mb-1.5'
const lblStyle = { color: '#64748B' }
const focusOn  = (e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)' }
const focusOff = (e) => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = '' }

const TABS = [
  { id: 'info',     label: 'Profile Info', icon: User },
  { id: 'password', label: 'Password',     icon: Lock },
  { id: 'mobile',   label: 'Mobile',       icon: Smartphone },
]

/* ── Change Password Tab ─────────────────────────────────────────────────── */
function PasswordTab({ user }) {
  const [current, setCurrent]     = useState('')
  const [next, setNext]           = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showCur, setShowCur]     = useState(false)
  const [showNew, setShowNew]     = useState(false)
  const [loading, setLoading]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (next !== confirm) { toast.error('Passwords do not match'); return }
    if (next.length < 6)  { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const cred = EmailAuthProvider.credential(user.email, current)
      await reauthenticateWithCredential(user, cred)
      await updatePassword(user, next)
      toast.success('Password updated successfully!')
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      const msg = err.code === 'auth/wrong-password' ? 'Current password is incorrect'
        : err.code === 'auth/too-many-requests' ? 'Too many attempts — try again later'
        : err.message
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={lbl} style={lblStyle}>Current Password</label>
        <div className="relative">
          <input
            id="profile-cur-pass" name="currentPassword" autoComplete="current-password"
            type={showCur ? 'text' : 'password'} value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={`${inp} pr-10`} style={inpStyle}
            onFocus={focusOn} onBlur={focusOff} required
          />
          <button type="button" onClick={() => setShowCur((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
            {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className={lbl} style={lblStyle}>New Password</label>
        <div className="relative">
          <input
            id="profile-new-pass" name="newPassword" autoComplete="new-password"
            type={showNew ? 'text' : 'password'} value={next}
            onChange={(e) => setNext(e.target.value)}
            className={`${inp} pr-10`} style={inpStyle}
            onFocus={focusOn} onBlur={focusOff} required
          />
          <button type="button" onClick={() => setShowNew((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className={lbl} style={lblStyle}>Confirm New Password</label>
        <input
          id="profile-confirm-pass" name="confirmPassword" autoComplete="new-password"
          type="password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inp} style={inpStyle}
          onFocus={focusOn} onBlur={focusOff} required
        />
      </div>
      <button type="submit" disabled={loading || !current || !next || !confirm}
        className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
        {loading ? <><Loader className="w-4 h-4 animate-spin" /> Updating...</> : <><Check className="w-4 h-4" /> Update Password</>}
      </button>
    </form>
  )
}

/* ── Change Mobile Tab ───────────────────────────────────────────────────── */
function MobileTab({ user }) {
  const [phone, setPhone]         = useState('')
  const [otp, setOtp]             = useState('')
  const [step, setStep]           = useState('input') // 'input' | 'otp'
  const [verificationId, setVid]  = useState(null)
  const [loading, setLoading]     = useState(false)
  const recaptchaRef              = useRef(null)
  const recaptchaWaiter           = useRef(null)

  const sendOtp = async (e) => {
    e.preventDefault()
    if (!phone.match(/^\+[1-9]\d{7,14}$/)) {
      toast.error('Enter a valid phone number with country code (e.g. +91 99999 99999)')
      return
    }
    setLoading(true)
    try {
      if (!recaptchaWaiter.current) {
        recaptchaWaiter.current = new RecaptchaVerifier(auth, recaptchaRef.current, { size: 'invisible' })
      }
      const provider = new PhoneAuthProvider(auth)
      const vid = await provider.verifyPhoneNumber(phone, recaptchaWaiter.current)
      setVid(vid)
      setStep('otp')
      toast.success('OTP sent to ' + phone)
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const cred = PhoneAuthProvider.credential(verificationId, otp)
      await updatePhoneNumber(user, cred)
      toast.success('Mobile number updated!')
      setPhone(''); setOtp(''); setStep('input'); setVid(null)
    } catch (err) {
      const msg = err.code === 'auth/invalid-verification-code' ? 'Incorrect OTP — please try again'
        : err.message
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#A78BFA' }} />
        <p className="text-xs" style={{ color: '#A78BFA' }}>
          Enter the new mobile number with country code. An OTP will be sent for verification via Firebase.
        </p>
      </div>

      {step === 'input' ? (
        <form onSubmit={sendOtp} className="space-y-4">
          <div>
            <label htmlFor="profile-phone" className={lbl} style={lblStyle}>New Mobile Number</label>
            <input
              id="profile-phone" name="phone" type="tel" autoComplete="tel"
              value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 99999 99999"
              className={inp} style={inpStyle}
              onFocus={focusOn} onBlur={focusOff} required
            />
          </div>
          <div ref={recaptchaRef} />
          <button type="submit" disabled={loading || !phone}
            className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Sending...</> : <>Send OTP</>}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-4">
          <p className="text-sm text-slate-400">OTP sent to <span className="text-white font-medium">{phone}</span></p>
          <div>
            <label htmlFor="profile-otp" className={lbl} style={lblStyle}>Enter OTP</label>
            <input
              id="profile-otp" name="otp" type="text" autoComplete="one-time-code"
              inputMode="numeric" maxLength={6}
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit code"
              className={inp} style={inpStyle}
              onFocus={focusOn} onBlur={focusOff} required
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setStep('input'); setOtp('') }}
              className="flex-1 py-2.5 text-sm rounded-lg text-slate-300 hover:text-white transition-colors"
              style={{ background: '#334155' }}>
              Back
            </button>
            <button type="submit" disabled={loading || otp.length < 6}
              className="flex-1 py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Verifying...</> : <><Check className="w-4 h-4" /> Verify</>}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

/* ── Profile Info Tab ────────────────────────────────────────────────────── */
function InfoTab({ user, role }) {
  const initial = user?.email?.[0]?.toUpperCase() || 'A'

  const rows = [
    { label: 'Email',         value: user?.email,              note: 'Cannot be changed' },
    { label: 'Display Name',  value: user?.displayName || '—'  },
    { label: 'Phone',         value: user?.phoneNumber || '—'  },
    { label: 'Role',          value: role || 'Admin'           },
    { label: 'UID',           value: user?.uid,                mono: true },
    { label: 'Email Verified',value: user?.emailVerified ? 'Yes' : 'No' },
    { label: 'Last Sign-In',  value: user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : '—' },
    { label: 'Account Created',value: user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : '—' },
  ]

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <div className="flex items-center gap-4 pb-4" style={{ borderBottom: '1px solid #1E293B' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)' }}>
          {initial}
        </div>
        <div>
          <p className="font-semibold text-white">{user?.displayName || user?.email?.split('@')[0]}</p>
          <p className="text-sm" style={{ color: '#64748B' }}>{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
            {role || 'Admin'}
          </span>
        </div>
      </div>

      {/* Detail rows */}
      <div className="space-y-2">
        {rows.map(({ label, value, note, mono }) => (
          <div key={label} className="flex items-start justify-between gap-4 py-2" style={{ borderBottom: '1px solid #1E293B' }}>
            <span className="text-xs font-semibold uppercase tracking-wider shrink-0 w-32" style={{ color: '#64748B' }}>{label}</span>
            <div className="text-right">
              <span className={`text-sm ${mono ? 'font-mono' : ''} text-slate-200 break-all`}>{value}</span>
              {note && <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main Modal ──────────────────────────────────────────────────────────── */
export default function ProfileModal({ isOpen, onClose }) {
  const { user, role } = useAuth()
  const [tab, setTab] = useState('info')

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; setTab('info') }
    else          document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const ActiveTab = tab === 'info' ? InfoTab : tab === 'password' ? PasswordTab : MobileTab

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden animate-slide-up"
        style={{ background: '#111827', border: '1px solid #1E293B', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1E293B' }}>
          <h2 className="text-base font-bold text-white">My Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3" style={{ borderBottom: '1px solid #1E293B' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all"
              style={tab === id
                ? { color: '#A78BFA', background: 'rgba(139,92,246,0.12)', borderBottom: '2px solid #8B5CF6' }
                : { color: '#64748B' }}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          <ActiveTab user={user} role={role} />
        </div>
      </div>
    </div>
  )
}
