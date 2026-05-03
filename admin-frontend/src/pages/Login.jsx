import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader, ArrowLeft, Mail } from 'lucide-react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../utils/firebase'
import { useAuth } from '../hooks/useAuth'
import { companyApi } from '../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const { login, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && user) {
      // Check if company is set up; if not, redirect to onboarding instead of dashboard.
      companyApi.get()
        .then((r) => {
          if (!r.data.data?._exists) {
            navigate('/onboarding/company', { replace: true })
          } else {
            navigate('/dashboard', { replace: true })
          }
        })
        .catch(() => {
          // If company check fails, fallback to dashboard
          navigate('/dashboard', { replace: true })
        })
    }
  }, [user, authLoading, navigate])
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSending, setResetSending] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setError('')
    try {
      await login(email, password)
      // Navigation is now handled by the useEffect above once 'user' state updates.
    } catch {
      setError('Invalid email or password')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!resetEmail.trim()) return
    setResetSending(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim())
      setResetSent(true)
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        toast.error('No account found with that email.')
      } else {
        toast.error('Failed to send reset email. Try again.')
      }
    } finally {
      setResetSending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #F0F9FF 0%, #dce8fb 50%, #dce8fb 100%)' }}>
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle,#0a3d95,transparent 70%)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,#6366F1,transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#0a3d95,#072d6e)', boxShadow: '0 8px 32px rgba(10,61,149,0.35)' }}
          >
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Nelloriens Admin</h1>
          <p className="text-sm mt-1 text-slate-500">
            {forgotMode ? 'Reset your password' : 'Sign in to manage your content'}
          </p>
        </div>

        <div
          className="rounded-2xl p-6 bg-white"
          style={{ border: '1px solid #dce8fb', boxShadow: '0 24px 48px rgba(10,61,149,0.12), 0 4px 16px rgba(0,0,0,0.06)' }}
        >

          {/* ── Forgot Password mode ── */}
          {forgotMode ? (
            resetSent ? (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: '#DCFCE7' }}>
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Check your inbox</p>
                  <p className="text-sm text-slate-500 mt-1">
                    A password reset link was sent to <strong>{resetEmail}</strong>
                  </p>
                </div>
                <button
                  onClick={() => { setForgotMode(false); setResetSent(false); setResetEmail('') }}
                  className="w-full py-2.5 text-white font-semibold text-sm rounded-lg"
                  style={{ background: 'linear-gradient(135deg,#0a3d95,#072d6e)' }}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors -mt-1 mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                </button>
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium mb-1.5 text-slate-700">Email Address</label>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="admin@nelloriens.com"
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 focus:outline-none transition-all"
                    style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}
                    onFocus={(e) => { e.target.style.borderColor = '#0a3d95'; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.12)' }}
                    onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetSending || !resetEmail.trim()}
                  className="w-full py-2.5 text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#0a3d95,#072d6e)', boxShadow: '0 4px 16px rgba(10,61,149,0.35)' }}
                >
                  {resetSending && <Loader className="w-4 h-4 animate-spin" />}
                  {resetSending ? 'Sending…' : 'Send Reset Email'}
                </button>
              </form>
            )
          ) : (
          /* ── Sign In mode ── */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium mb-1.5 text-slate-700">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@nelloriens.com"
                {...register('email', { required: true })}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 focus:outline-none transition-all"
                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}
                onFocus={(e) => { e.target.style.borderColor = '#0a3d95'; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.12)' }}
                onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-xs font-medium hover:opacity-80 transition-opacity"
                  style={{ color: '#0a3d95' }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', { required: true })}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm text-slate-800 focus:outline-none transition-all"
                  style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}
                  onFocus={(e) => { e.target.style.borderColor = '#0a3d95'; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.12)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2"
                style={{ color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              style={{ background: 'linear-gradient(135deg,#0a3d95,#072d6e)', boxShadow: '0 4px 16px rgba(10,61,149,0.35)' }}
            >
              {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  )
}
