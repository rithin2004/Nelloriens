import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Newspaper, Briefcase, GraduationCap, Trophy,
  UtensilsCrossed, Landmark, Hotel, CalendarDays, Film,
  Bus, Tag, MapPin, Phone, Bell, Megaphone, Heart,
  ChevronLeft, ChevronRight, Inbox, Zap,
} from 'lucide-react'
import { InstagramIcon } from '../common/SocialIcon'
import { settingsApi } from '../../services/api'

const P = '#0a3d95'

const navGroups = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'News',          to: '/news/list',              icon: Newspaper },
      { label: 'Breaking News', to: '/news/breaking-points',   icon: Zap       },
      { label: 'Jobs',          to: '/jobs/list',              icon: Briefcase },
      { label: 'Results',       to: '/results/list',           icon: GraduationCap },
      { label: 'Sports',        to: '/sports/list',            icon: Trophy    },
    ],
  },
  {
    label: 'City Guide',
    items: [
      { label: 'Foods',     to: '/foods',             icon: UtensilsCrossed },
      { label: 'History',   to: '/history',           icon: Landmark },
      { label: 'Stays',     to: '/stays/list',        icon: Hotel },
      { label: 'Events',    to: '/events/list',       icon: CalendarDays },
      { label: 'Movies',    to: '/movies/list',       icon: Film },
      { label: 'Transport', to: '/transport/list',    icon: Bus },
      { label: 'Offers',    to: '/offers/list',       icon: Tag },
      { label: 'Tourism',   to: '/tourism/list',      icon: MapPin },
    ],
  },
  {
    label: 'Manage',
    items: [
      { label: 'Contact',      to: '/contact/list',   icon: Phone },
      { label: 'Leads',        to: '/leads',          icon: Inbox },
      { label: 'Updates',      to: '/updates/list',   icon: Bell },
      { label: 'Ads',          to: '/ads/list',       icon: Megaphone },
      { label: 'Sponsorships', to: '/sponsorships/list', icon: Heart },
      { label: 'Instagram',    to: '/instagram',      icon: (p) => <InstagramIcon {...p} /> },
    ],
  },
]

export function NavItem({ item, isOpen }) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(item.to)
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      title={!isOpen ? item.label : undefined}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative"
      style={isActive
        ? {
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            color: '#FFFFFF',
          }
        : { color: 'rgba(255,255,255,0.75)', border: '1px solid transparent' }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {isOpen && <span className="truncate">{item.label}</span>}
      {!isOpen && (
        <span
          className="absolute left-full ml-3 px-2.5 py-1.5 text-xs rounded-lg pointer-events-none whitespace-nowrap z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity font-medium"
          style={{ background: '#0a3d95', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {item.label}
        </span>
      )}
    </NavLink>
  )
}

export function NavGroups({ isOpen }) {
  return (
    <>
      {navGroups.map((group) => (
        <div key={group.label}>
          {isOpen && (
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavItem key={item.to} item={item} isOpen={isOpen} />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    settingsApi.getSiteConfig()
      .then((r) => { if (r.data?.logoUrl) setLogoUrl(r.data.logoUrl) })
      .catch(() => {})
  }, [])

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 ${isOpen ? 'w-56' : 'w-16'}`}
      style={{
        background: `linear-gradient(180deg, ${P} 0%, #072d6e 100%)`,
        borderRight: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-14 px-4 shrink-0 ${isOpen ? 'gap-2.5' : 'justify-center'}`}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-contain bg-white p-0.5 shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-sm"
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
            N
          </div>
        )}
        {isOpen && <span className="text-white font-bold text-base tracking-tight">Nelloriens</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 sidebar-scroll">
        <NavGroups isOpen={isOpen} />
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="m-2 flex items-center justify-center h-8 rounded-lg transition-colors"
        style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFFFFF' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </aside>
  )
}
