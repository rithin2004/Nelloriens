import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, User, Settings, KeyRound } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import GlobalSearch from '../common/GlobalSearch'
import ChangePasswordModal from '../common/ChangePasswordModal'

const P = '#0a3d95'

const pageTitles = {
  '/dashboard':    'Dashboard',
  '/news':         'News',
  '/jobs':         'Jobs',
  '/results':      'Results',
  '/sports':       'Sports',
  '/foods':        'Foods',
  '/history':      'History',
  '/stays':        'Stays',
  '/events':       'Events',
  '/movies':       'Movies',
  '/transport':    'Transport',
  '/offers':       'Offers',
  '/tourism':      'Tourism',
  '/contact':      'Contact',
  '/leads':        'Leads',
  '/updates':      'Updates',
  '/ads':          'Ads',
  '/sponsorships': 'Sponsorships',
  '/instagram':    'Instagram',
  '/company':      'Company',
  '/profile':      'My Profile',
  '/settings':     'Settings',
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
  const [showChangePw, setShowChangePw] = useState(false)

  const handleLogout = async () => { await logout(); navigate('/login') }

  const initial = user?.photoURL
    ? null
    : (user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A')

  return (
    <>
      <header
      className="h-14 flex items-center px-3 sm:px-5 gap-2 sm:gap-3 relative z-20 shrink-0"
      style={{
        background: `linear-gradient(90deg, ${P} 0%, #072d6e 100%)`,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Left — hamburger + page title */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.8)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="hidden sm:block text-sm font-semibold text-white/90 min-w-fit">
          {getTitle(location.pathname)}
        </h1>
      </div>

      {/* Center — Global Search (truly centered) */}
      <div className="flex-1 flex justify-center px-2">
        <GlobalSearch />
      </div>

      {/* Right — user profile card */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowMenu((p) => !p)}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar"
              className="w-7 h-7 rounded-full object-cover shrink-0 ring-2 ring-white/30" />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}>
              {initial}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white/90 leading-tight max-w-28 truncate">
              {user?.displayName || user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] text-white/50 leading-tight">
              {role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        </button>

        {showMenu && (
          <>
            <div
              className="absolute right-0 top-full mt-2 w-60 rounded-xl overflow-hidden z-50"
              style={{
                background: '#FFFFFF',
                border: '1px solid #dce8fb',
                boxShadow: '0 12px 32px rgba(10,61,149,0.15), 0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {/* User info card */}
              <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #eef3fd', background: '#eef3fd' }}>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
                    {initial}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: P }}>
                    {user?.displayName || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs truncate text-slate-500">{user?.email}</p>
                  {role && (
                    <span className="inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: P, color: '#FFFFFF' }}>
                      {role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  )}
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button onClick={() => { navigate('/profile'); setShowMenu(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <User className="w-4 h-4" style={{ color: P }} />
                  My Profile
                </button>

                <button onClick={() => { setShowMenu(false); setShowChangePw(true) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <KeyRound className="w-4 h-4" style={{ color: P }} />
                  Change Password
                </button>

                {role === 'super_admin' && (
                  <button onClick={() => { navigate('/settings'); setShowMenu(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Settings className="w-4 h-4" style={{ color: P }} />
                    Settings
                  </button>
                )}
              </div>

              <div style={{ borderTop: '1px solid #eef3fd' }}>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
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

      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </>
  )
}
