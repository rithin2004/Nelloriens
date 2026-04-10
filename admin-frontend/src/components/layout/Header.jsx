import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, User, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import GlobalSearch from '../common/GlobalSearch'

const P = '#0a3d95'

const pageTitles = {
  '/dashboard':           'Dashboard',
  '/news':                'News',
  '/jobs':                'Jobs',
  '/results':             'Results',
  '/sports':              'Sports',
  '/foods':               'Foods',
  '/history':             'History',
  '/stays':               'Stays',
  '/events':              'Events',
  '/movies':              'Movies',
  '/transport':           'Transport',
  '/offers':              'Offers',
  '/tourism':             'Tourism',
  '/contact':             'Contact',
  '/leads':               'Leads',
  '/updates':             'Updates',
  '/ads':                 'Ads',
  '/sponsorships':        'Sponsorships',
  '/instagram':           'Instagram',
  '/profile':             'My Profile',
  '/settings':            'Settings',
}

function getTitle(pathname) {
  for (const [key, val] of Object.entries(pageTitles)) {
    if (pathname.startsWith(key)) return val
  }
  return 'Admin'
}

export default function Header({ onMenuClick }) {
  const { user, logout, role } = useAuth()
  const location = useLocation()
  const navigate  = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => { await logout(); navigate('/login') }

  const initial = user?.photoURL
    ? null
    : (user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A')

  return (
    <header
      className="h-14 flex items-center px-4 sm:px-5 gap-3 relative z-20 shrink-0"
      style={{
        background: `linear-gradient(90deg, ${P} 0%, #072d6e 100%)`,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg transition-colors shrink-0"
        style={{ color: 'rgba(255,255,255,0.8)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title — hidden on very small screens */}
      <h1 className="hidden sm:block text-sm font-semibold text-white/90 shrink-0 min-w-fit">
        {getTitle(location.pathname)}
      </h1>

      {/* Global search */}
      <GlobalSearch />

      {/* Right — user menu */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowMenu((p) => !p)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full object-cover shrink-0 ring-2 ring-white/30" />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}>
              {initial}
            </div>
          )}
          <span className="text-sm text-white/90 hidden sm:block max-w-32 truncate font-medium">
            {user?.displayName || user?.email?.split('@')[0]}
          </span>
        </button>

        {showMenu && (
          <>
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
              style={{
                background: '#FFFFFF',
                border: '1px solid #dce8fb',
                boxShadow: '0 12px 32px rgba(10,61,149,0.15), 0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {/* User info */}
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #eef3fd', background: '#eef3fd' }}>
                <p className="text-xs font-bold truncate" style={{ color: P }}>
                  {user?.displayName || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs truncate mt-0.5 text-slate-500">{user?.email}</p>
                {role && (
                  <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ background: P, color: '#FFFFFF' }}>
                    {role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                )}
              </div>

              <button onClick={() => { navigate('/profile'); setShowMenu(false) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                <User className="w-4 h-4" style={{ color: P }} />
                Profile
              </button>

              {role === 'super_admin' && (
                <button onClick={() => { navigate('/settings'); setShowMenu(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                  <Settings className="w-4 h-4" style={{ color: P }} />
                  Settings
                </button>
              )}

              <div style={{ borderTop: '1px solid #eef3fd' }}>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors font-medium">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
            <div className="fixed inset-0 z-[-1]" onClick={() => setShowMenu(false)} />
          </>
        )}
      </div>
    </header>
  )
}
