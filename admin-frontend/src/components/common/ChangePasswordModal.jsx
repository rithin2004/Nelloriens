import { useState } from 'react'
import { X, Eye, EyeOff, KeyRound, Loader, Check, ShieldCheck } from 'lucide-react'
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth'
import { auth } from '../../utils/firebase'
import toast from 'react-hot-toast'

const P   = '#0a3d95'
const PL  = '#dce8fb'
const PB  = '#eef3fd'
const inp = 'w-full px-3 py-2.5 pr-10 rounded-lg text-sm text-slate-800 focus:outline-none transition-all'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
const focusOn  = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const focusOff = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }
const lbl = 'block text-sm font-medium text-slate-700 mb-1.5'

function strengthScore(pw) {
  let score = 0
  if (pw.length >= 8)          score++
  if (/[A-Z]/.test(pw))        score++
  if (/[a-z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
const strengthColor = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#16A34A']

function PasswordStrength({ password }) {
  if (!password) return null
  const score = strengthScore(password)
  const color = strengthColor[score]
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i <= score ? color : '#E2E8F0' }} />
        ))}
      </div>
      <p className="text-xs" style={{ color }}>{strengthLabel[score]}</p>
    </div>
  )
}

function Rule({ ok, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
        style={{ background: ok ? '#DCFCE7' : '#F1F5F9' }}>
        <Check className="w-2.5 h-2.5" style={{ color: ok ? '#16A34A' : '#94A3B8' }} />
      </div>
      <span style={{ color: ok ? '#16A34A' : '#64748B' }}>{label}</span>
    </div>
  )
}

export default function ChangePasswordModal({ onClose }) {
  const [currentPw,  setCurrentPw]  = useState('')
  const [newPw,      setNewPw]      = useState('')
  const [confirmPw,  setConfirmPw]  = useState('')
  const [showCur,    setShowCur]    = useState(false)
  const [showNew,    setShowNew]    = useState(false)
  const [showConf,   setShowConf]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  const rules = {
    len:     newPw.length >= 8,
    upper:   /[A-Z]/.test(newPw),
    lower:   /[a-z]/.test(newPw),
    digit:   /[0-9]/.test(newPw),
    special: /[^A-Za-z0-9]/.test(newPw),
  }
  const allRulesMet = Object.values(rules).every(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!allRulesMet) { setError('Password does not meet all requirements.'); return }
    if (newPw !== confirmPw) { setError('New passwords do not match.'); return }

    const user = auth.currentUser
    if (!user?.email) { setError('No authenticated user found.'); return }

    setLoading(true)
    try {
      // Re-authenticate with current password to verify it
      const credential = EmailAuthProvider.credential(user.email, currentPw)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPw)
      toast.success('Password changed successfully!')
      onClose()
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Current password is incorrect.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.')
      } else {
        setError(err.message || 'Failed to change password.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden animate-slide-up"
        style={{ background: '#FFFFFF', border: `1px solid ${PL}`, boxShadow: '0 24px 64px rgba(10,61,149,0.18)' }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${PL}`, background: PB }}>
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4" style={{ color: P }} />
            <h3 className="font-bold text-slate-800">Change Password</h3>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Current password */}
          <div>
            <label htmlFor="changepw-current" className={lbl}>Current Password</label>
            <div className="relative">
              <input
                id="changepw-current"
                name="currentPassword"
                type={showCur ? 'text' : 'password'}
                value={currentPw}
                onChange={(e) => { setCurrentPw(e.target.value); setError('') }}
                autoComplete="current-password"
                placeholder="Enter your current password"
                className={inp}
                style={inpStyle}
                onFocus={focusOn}
                onBlur={focusOff}
                required
              />
              <button type="button" onClick={() => setShowCur((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label htmlFor="changepw-new" className={lbl}>New Password</label>
            <div className="relative">
              <input
                id="changepw-new"
                name="newPassword"
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => { setNewPw(e.target.value); setError('') }}
                autoComplete="new-password"
                placeholder="Create a strong password"
                className={inp}
                style={inpStyle}
                onFocus={focusOn}
                onBlur={focusOff}
                required
              />
              <button type="button" onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={newPw} />
            {newPw && (
              <div className="mt-2 grid grid-cols-2 gap-1">
                <Rule ok={rules.len}     label="Min 8 characters" />
                <Rule ok={rules.upper}   label="Uppercase letter" />
                <Rule ok={rules.lower}   label="Lowercase letter" />
                <Rule ok={rules.digit}   label="Number" />
                <Rule ok={rules.special} label="Special character" />
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="changepw-confirm" className={lbl}>Confirm New Password</label>
            <div className="relative">
              <input
                id="changepw-confirm"
                name="confirmPassword"
                type={showConf ? 'text' : 'password'}
                value={confirmPw}
                onChange={(e) => { setConfirmPw(e.target.value); setError('') }}
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                className={inp}
                style={inpStyle}
                onFocus={focusOn}
                onBlur={focusOff}
                required
              />
              <button type="button" onClick={() => setShowConf((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPw && newPw && confirmPw !== newPw && (
              <p className="text-xs mt-1" style={{ color: '#EF4444' }}>Passwords do not match</p>
            )}
            {confirmPw && newPw && confirmPw === newPw && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#16A34A' }}>
                <ShieldCheck className="w-3.5 h-3.5" /> Passwords match
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm rounded-lg px-3 py-2"
              style={{ color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA' }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              style={{ border: '1px solid #E2E8F0' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !currentPw || !newPw || !confirmPw}
              className="flex-1 py-2.5 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 4px 16px rgba(10,61,149,0.25)' }}>
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Saving…</> : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
