import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Users, FileText, ChevronRight, Upload, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { settingsApi, uploadApi } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

const inp = 'w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-all'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
const lbl = 'block text-sm font-medium text-slate-700 mb-1.5'
const card = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }

export default function Settings() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, reset } = useForm()
  const [saving, setSaving] = useState(false)

  // Company logo state
  const [logoUrl, setLogoUrl]         = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const logoRef = useRef(null)

  useEffect(() => {
    settingsApi.getSiteConfig()
      .then((r) => {
        reset(r.data)
        if (r.data?.logoUrl) setLogoUrl(r.data.logoUrl)
      })
      .catch(() => {})
  }, [reset])

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2 MB'); return }
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadApi.upload(fd)
      const url = res.data?.url
      if (!url) throw new Error('Upload failed')
      setLogoUrl(url)
      // auto-save logo immediately
      await settingsApi.updateSiteConfig({ logoUrl: url })
      toast.success('Logo updated!')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setLogoUploading(false)
      e.target.value = ''
    }
  }

  const removeLogo = async () => {
    setLogoUrl('')
    try { await settingsApi.updateSiteConfig({ logoUrl: '' }) }
    catch {}
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await settingsApi.updateSiteConfig({ ...data, logoUrl })
      toast.success('Settings saved!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <PageHeader title="Settings" />

      {/* Company Logo */}
      <div style={card}>
        <h2 className="font-semibold text-slate-800 mb-4">Company Logo</h2>
        <div className="flex items-center gap-5">
          {/* Preview */}
          <div className="w-24 h-24 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
            style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1' }}>
            {logoUrl ? (
              <>
                <img src={logoUrl} alt="Company Logo" className="w-full h-full object-contain p-2" />
                <button
                  onClick={removeLogo}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white transition-opacity"
                  style={{ background: '#EF4444' }}
                  title="Remove logo">
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <span className="text-3xl font-bold text-slate-300">N</span>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            <button
              onClick={() => logoRef.current?.click()}
              disabled={logoUploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
              style={{ background: '#dce8fb', border: '1px solid #dce8fb', color: '#072d6e' }}
              onMouseEnter={(e) => !logoUploading && (e.currentTarget.style.background = '#dce8fb')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#dce8fb')}>
              <Upload className="w-4 h-4" />
              {logoUploading ? 'Uploading…' : logoUrl ? 'Change Logo' : 'Upload Logo'}
            </button>
            <p className="text-xs text-slate-400">PNG, SVG or WebP · Max 2 MB · Recommended 200×200px</p>
          </div>
        </div>
      </div>

      {/* Site Config */}
      <div style={card}>
        <h2 className="font-semibold text-slate-800 mb-4">Site Configuration</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="site-name" className={lbl}>Site Name</label>
            <input id="site-name" name="siteName" autoComplete="organization"
              {...register('siteName')} className={inp} style={inpStyle}
              onFocus={(e) => { e.target.style.borderColor = '#0a3d95'; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }}
              onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }}
              placeholder="e.g. Nelloriens" />
          </div>
          <div>
            <label htmlFor="site-metadesc" className={lbl}>Meta Description</label>
            <textarea id="site-metadesc" name="metaDescription" autoComplete="off"
              {...register('metaDescription')} rows={2} className={`${inp} resize-none`} style={inpStyle}
              onFocus={(e) => { e.target.style.borderColor = '#0a3d95'; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }}
              onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }}
              placeholder="Short description for search engines…" />
          </div>
          <div>
            <label htmlFor="site-ga" className={lbl}>Google Analytics ID</label>
            <input id="site-ga" name="gaId" autoComplete="off"
              {...register('gaId')} className={inp} style={inpStyle}
              onFocus={(e) => { e.target.style.borderColor = '#0a3d95'; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }}
              onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }}
              placeholder="G-XXXXXXXXXX" />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Super admin links */}
      {role === 'super_admin' && (
        <div style={card}>
          <h2 className="font-semibold text-slate-800 mb-4">Admin Controls</h2>
          <div className="space-y-2">
            {[
              { label: 'Manage Users & Permissions', to: '/settings/admins', icon: Users },
              { label: 'View Audit Logs',            to: '/settings/audit-logs', icon: FileText },
            ].map(({ label, to, icon: Icon }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-700 hover:text-slate-900 transition-all"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.background = '#FAF5FF' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC' }}>
                <Icon className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                {label}
                <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
