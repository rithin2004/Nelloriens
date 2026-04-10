import { useRef, useState } from 'react'
import { updateProfile } from 'firebase/auth'
import { auth } from '../../utils/firebase'
import { useAuth } from '../../hooks/useAuth'
import { Camera, ShieldCheck, AlertCircle, X, Loader, Check, User, Mail, Hash, CalendarDays, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadApi } from '../../services/api'
import PageHeader from '../../components/common/PageHeader'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

function EditPhotoPopup({ user, onClose, onSaved }) {
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(user?.photoURL || null)
  const [file, setFile]       = useState(null)
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
        style={{ background: '#FFFFFF', border: `1px solid ${PL}`, boxShadow: '0 24px 64px rgba(10,61,149,0.15)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${PL}`, background: PB }}>
          <h3 className="font-bold text-slate-800">Change Profile Photo</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {preview
                ? <img src={preview} alt="Preview" className="w-24 h-24 rounded-2xl object-cover" />
                : <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
                    style={{ background: `linear-gradient(135deg,${P},#6366F1)` }}>{initial}</div>
              }
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}>
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button onClick={() => fileRef.current?.click()}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: P }}>
              {preview && preview !== user?.photoURL ? 'Change selection' : 'Choose a photo'}
            </button>
            <p className="text-xs text-slate-400">JPG, PNG or WebP · Max 5 MB</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 text-sm rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              style={{ border: '1px solid #E2E8F0' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={!file || loading}
              className="flex-1 py-2.5 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 4px 16px rgba(10,61,149,0.25)' }}>
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Photo</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoField({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: PB }}>
        <Icon className="w-4 h-4" style={{ color: P }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
        <p className={`text-sm text-slate-700 break-all ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, role } = useAuth()
  const [editOpen, setEditOpen]   = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh  = () => setRefreshKey((k) => k + 1)
  const initial  = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'

  return (
    <div className="animate-fade-in" key={refreshKey}>
      <PageHeader title="My Profile" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — avatar card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl p-6 flex flex-col items-center text-center gap-4"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div className="relative">
              {user?.photoURL
                ? <img src={user.photoURL} alt="Profile"
                    className="w-28 h-28 rounded-2xl object-cover"
                    style={{ boxShadow: '0 8px 24px rgba(10,61,149,0.2)' }} />
                : <div className="w-28 h-28 rounded-2xl flex items-center justify-center text-4xl font-bold text-white"
                    style={{ background: `linear-gradient(135deg,${P},#6366F1)`, boxShadow: '0 8px 24px rgba(10,61,149,0.25)' }}>
                    {initial}
                  </div>
              }
              <button
                onClick={() => setEditOpen(true)}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}
                title="Change profile photo">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="font-bold text-slate-800 text-lg leading-tight">
                {user?.displayName || user?.email?.split('@')[0]}
              </h2>
              <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: PL, color: P }}>
                {role === 'super_admin' ? 'Super Admin' : role || 'Admin'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-sm">
              {user?.emailVerified
                ? <><ShieldCheck className="w-4 h-4 text-green-600" /><span className="text-green-600 font-medium">Email verified</span></>
                : <><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-red-500">Not verified</span></>}
            </div>

            <button
              onClick={() => setEditOpen(true)}
              className="w-full py-2.5 text-sm font-semibold rounded-xl transition-all hover:opacity-90"
              style={{ background: PB, color: P, border: `1px solid ${PL}` }}>
              Change Photo
            </button>
          </div>
        </div>

        {/* Right — details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl p-5"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 className="text-sm font-bold text-slate-700 mb-4 pb-3" style={{ borderBottom: `1px solid #F1F5F9` }}>
              Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoField icon={User}       label="Display Name" value={user?.displayName} />
              <InfoField icon={Mail}       label="Email"        value={user?.email} />
              <InfoField icon={Hash}       label="User ID"      value={user?.uid}  mono />
              <InfoField icon={CalendarDays} label="Member Since"
                value={user?.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'} />
              <InfoField icon={Clock}      label="Last Sign In"
                value={user?.metadata?.lastSignInTime
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'} />
            </div>
          </div>

          <div className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: PB, border: `1px solid ${PL}` }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: P }} />
            <p className="text-xs text-slate-600 leading-relaxed">
              To change your <strong>name</strong>, <strong>email</strong>, or <strong>password</strong> —
              use <em>Change Password</em> from the top-right menu, or contact your super admin.
            </p>
          </div>
        </div>
      </div>

      {editOpen && <EditPhotoPopup user={user} onClose={() => setEditOpen(false)} onSaved={refresh} />}
    </div>
  )
}
