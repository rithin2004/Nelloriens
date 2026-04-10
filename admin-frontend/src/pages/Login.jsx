import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password')
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
          <p className="text-sm mt-1 text-slate-500">Sign in to manage your content</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl p-6 space-y-4 bg-white"
          style={{ border: '1px solid #dce8fb', boxShadow: '0 24px 48px rgba(10,61,149,0.12), 0 4px 16px rgba(0,0,0,0.06)' }}
        >
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
            <label htmlFor="login-password" className="block text-sm font-medium mb-1.5 text-slate-700">
              Password
            </label>
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
      </div>
    </div>
  )
}
