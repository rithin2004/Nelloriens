import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Clock } from 'lucide-react'
import Sidebar from './Sidebar'
import MobileSidebar from './MobileSidebar'
import Header from './Header'
import { useInactivityLogout } from '../../hooks/useInactivityLogout'
import { useSSE } from '../../hooks/useSSE'

const P  = '#0a3d95'
const PL = '#dce8fb'

function InactivityWarning({ onStay }) {
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden animate-fade-in"
        style={{ background: '#FFFFFF', border: `1px solid ${PL}`, boxShadow: '0 24px 64px rgba(10,61,149,0.18)' }}
      >
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#FEF3C7' }}>
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Session Expiring Soon</h3>
          <p className="text-sm text-slate-500">
            You've been inactive for 55 minutes. You'll be logged out automatically in <strong>5 minutes</strong>.
          </p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onStay}
            className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 4px 14px rgba(10,61,149,0.3)' }}
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function AdminLayout({ children }) {
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [warnVisible, setWarnVisible] = useState(false)

  useSSE()

  const { extendSession } = useInactivityLogout({
    onWarn:        () => setWarnVisible(true),
    onDismissWarn: () => setWarnVisible(false),
  })

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#eef3fd' }}>
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ background: '#eef3fd' }}>
          {children}
        </main>
      </div>

      {warnVisible && (
        <InactivityWarning onStay={() => { extendSession(); setWarnVisible(false) }} />
      )}
    </div>
  )
}
