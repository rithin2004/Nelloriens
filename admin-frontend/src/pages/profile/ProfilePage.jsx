import { useRef, useState } from 'react'
import { updateProfile } from 'firebase/auth'
import { auth } from '../../utils/firebase'
import { useAuth } from '../../hooks/useAuth'
import { Camera, ShieldCheck, AlertCircle, X, Loader, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadApi } from '../../services/api'

const card = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
const primaryBtn = { background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.25)' }

function EditPhotoPopup({ user, onClose, onSaved }) {
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(user?.photoURL || null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5 MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSave = async () => {
    if (!file) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadApi.upload(fd)
      const url = res.data?.url
      if (!url) throw new Error('Upload failed')
      await updateProfile(auth.currentUser, { photoURL: url })
      toast.success('Profile photo updated!')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const initial = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden animate-slide-up"
        style={{ background: '#FFFFFF', border: '1px solid #dce8fb', boxShadow: '0 24px 64px rgba(10,61,149,0.15)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #dce8fb', background: '#eef3fd' }}>
          <h3 className="font-bold text-slate-800">Change Profile Photo</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Avatar preview */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {preview
                ? <img src={preview} alt="Preview" className="w-24 h-24 rounded-2xl object-cover" style={{ boxShadow: '0 8px 24px rgba(2,132,199,0.2)' }} />
                : <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white" style={{ background: 'linear-gradient(135deg,#0a3d95,#6366F1)' }}>{initial}</div>
              }
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}>
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileRef.current?.click()}
              className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors">
              {preview && preview !== user?.photoURL ? 'Change selection' : 'Choose a photo'}
            </button>
            <p className="text-xs text-slate-400">JPG, PNG or WebP · Max 5 MB</p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" style={{ border: '1px solid #E2E8F0' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={!file || loading}
              className="flex-1 py-2.5 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={primaryBtn}>
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Photo</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, role } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => setRefreshKey((k) => k + 1)

  const initial = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'

  return (
    <div className="max-w-xl space-y-6 animate-fade-in" key={refreshKey}>
      <div style={card}>
        {/* Avatar + info */}
        <div className="flex flex-col items-center text-center gap-4 pb-6" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="relative">
            {user?.photoURL
              ? <img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-2xl object-cover" style={{ boxShadow: '0 8px 24px rgba(2,132,199,0.2)' }} />
              : <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white" style={{ background: 'linear-gradient(135deg,#0a3d95,#6366F1)', boxShadow: '0 8px 24px rgba(10,61,149,0.25)' }}>{initial}</div>
            }
            <button
              onClick={() => setEditOpen(true)}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}
              title="Change profile photo">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="font-bold text-slate-800 text-xl">{user?.displayName || user?.email?.split('@')[0]}</h2>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-semibold" style={{ background: '#EDE9FE', color: '#6D28D9' }}>
              {role === 'super_admin' ? 'Super Admin' : role || 'Admin'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {user?.emailVerified
              ? <><ShieldCheck className="w-4 h-4 text-green-600" /><span className="text-sm text-green-600 font-medium">Email verified</span></>
              : <><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-sm text-red-500">Email not verified</span></>}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {[
            { label: 'Email',        value: user?.email },
            { label: 'User ID',      value: user?.uid, mono: true, truncate: true },
            { label: 'Member Since', value: user?.metadata?.creationTime  ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN')  : '—' },
            { label: 'Last Sign In', value: user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-IN') : '—' },
          ].map(({ label, value, mono, truncate: tr }) => (
            <div key={label} className="rounded-lg p-3" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">{label}</p>
              <p className={`text-sm text-slate-700 ${mono ? 'font-mono text-xs' : ''} ${tr ? 'truncate' : ''}`}>{value}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-400 text-center">
          To change your name, email, or password — contact your super admin.
        </p>
      </div>

      {editOpen && <EditPhotoPopup user={user} onClose={() => setEditOpen(false)} onSaved={refresh} />}
    </div>
  )
}
