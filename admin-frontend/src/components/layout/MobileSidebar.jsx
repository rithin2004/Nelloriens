import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { NavGroups } from './Sidebar'
import { companyApi } from '../../services/api'

const P = '#0a3d95'

export default function MobileSidebar({ isOpen, onClose }) {
  const [logoUrl,     setLogoUrl]     = useState('')
  const [companyName, setCompanyName] = useState('Admin')

  useEffect(() => {
    companyApi.get()
      .then((r) => {
        if (r.data?.logoUrl) setLogoUrl(r.data.logoUrl)
        if (r.data?.name)    setCompanyName(r.data.name)
      })
      .catch(() => {})
  }, [])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col lg:hidden"
        style={{
          background: `linear-gradient(180deg, ${P} 0%, #072d6e 100%)`,
          borderRight: '1px solid rgba(255,255,255,0.1)',
          animation: 'slideInLeft 0.25s ease',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between h-14 px-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-contain bg-white p-0.5" />
            ) : (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                N
              </div>
            )}
            <span className="text-white font-bold text-base tracking-tight truncate">{companyName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav — close drawer on link click */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 sidebar-scroll" onClick={onClose}>
          <NavGroups isOpen={true} />
        </nav>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
