import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Newspaper, Briefcase, CalendarDays, Trophy,
  UtensilsCrossed, MapPin, Hotel, Film, Plus,
  Inbox, Bell, Star, Play, Clock,
} from 'lucide-react'
import { dashboardApi } from '../services/api'
import { timeAgo } from '../utils/helpers'
import LoadingSpinner from '../components/common/LoadingSpinner'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const statCards = [
  { label: 'Total News',         key: 'news',    icon: Newspaper,       color: '#2563EB', bg: '#DBEAFE' },
  { label: 'Active Jobs',        key: 'jobs',    icon: Briefcase,       color: '#16A34A', bg: '#DCFCE7' },
  { label: 'Upcoming Events',    key: 'events',  icon: CalendarDays,    color: '#7C3AED', bg: '#EDE9FE' },
  { label: 'Live Sports',        key: 'sports',  icon: Trophy,          color: '#DC2626', bg: '#FEE2E2' },
  { label: 'Total Foods',        key: 'foods',   icon: UtensilsCrossed, color: '#D97706', bg: '#FEF3C7' },
  { label: 'Tourism Spots',      key: 'tourism', icon: MapPin,          color: '#0F766E', bg: '#CCFBF1' },
  { label: 'Hotels & Stays',     key: 'stays',   icon: Hotel,           color: '#4F46E5', bg: '#E0E7FF' },
  { label: 'Movies Now Showing', key: 'movies',  icon: Film,            color: '#BE185D', bg: '#FCE7F3' },
]

function StatCard({ s, value }) {
  const Icon = s.icon
  return (
    <div
      className="rounded-xl p-4 bg-white transition-all hover:-translate-y-0.5"
      style={{ border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{s.label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value ?? '—'}</p>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: s.bg }}>
          <Icon className="w-5 h-5" style={{ color: s.color }} />
        </div>
      </div>
    </div>
  )
}

function SectionCard({ icon, iconColor, title, children, action }) {
  const Icon = icon
  return (
    <div className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${PL}`, background: PB }}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: iconColor || P }} />
          <h2 className="font-semibold text-slate-700 text-sm">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats,           setStats]          = useState({})
  const [recentLeads,     setRecentLeads]    = useState([])
  const [recentActivity,  setRecentActivity] = useState([])
  const [featured,        setFeatured]       = useState({})
  const [loading,         setLoading]        = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats().then((r) => setStats(r.data.data || {})).catch(() => {}),
      dashboardApi.getRecentLeads().then((r) => setRecentLeads(r.data.data || [])).catch(() => {}),
      dashboardApi.getActivity({ page: 1, limit: 5 }).then((r) => setRecentActivity(r.data?.data || [])).catch(() => {}),
      dashboardApi.getFeatured().then((r) => setFeatured(r.data.data || {})).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const topNews    = featured.news    || []
  const nowMovies  = featured.movies  || []
  const upcomingEvents = featured.events || []

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s) => <StatCard key={s.key} s={s} value={stats[s.key]} />)}
      </div>

      {/* Middle row — Recent Leads + Recent Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Leads */}
        <SectionCard
          icon={Inbox}
          iconColor="#7C3AED"
          title="Recent Leads"
          action={
            <button onClick={() => navigate('/leads')}
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: P }}>
              View all
            </button>
          }
        >
          {recentLeads.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">No leads yet</p>
          ) : (
            <ul>
              {recentLeads.slice(0, 5).map((lead, i) => (
                <li key={i} className="flex items-start gap-3 px-5 py-3 transition-colors"
                  style={{ borderBottom: '1px solid #F8FAFC' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = PB}
                  onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
                    {lead.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{lead.name || 'Anonymous'}</p>
                    <p className="text-xs text-slate-400 truncate">{lead.email || lead.phone || '—'}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 mt-0.5">{timeAgo(lead.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Recent Activity */}
        <SectionCard
          icon={Bell}
          iconColor="#D97706"
          title="Recent Activity"
          action={
            <button onClick={() => navigate('/activity')}
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: P }}>
              View all
            </button>
          }
        >
          {recentActivity.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">No activity yet</p>
          ) : (
            <ul>
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
                    {item.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      <span className="font-medium">{item.email || 'Unknown'}</span>
                      {' '}
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.action === 'delete' ? 'bg-red-100 text-red-600' :
                        item.action === 'create' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>{item.action}</span>
                      {' '}
                      <span className="text-slate-500 capitalize">{item.module}</span>
                    </p>
                    {item.meta?.title && <p className="text-xs text-slate-400 truncate">{item.meta.title}</p>}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{timeAgo(item.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Live Right Now */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#EF4444' }} />
          <h2 className="font-bold text-slate-700">Live Right Now</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Important / Featured News */}
          <SectionCard icon={Star} iconColor="#D97706" title="Featured News">
            {topNews.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No featured news</p>
            ) : (
              <ul>
                {topNews.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid #F8FAFC' }}
                    onClick={() => navigate(`/news/update/${item._id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.background = PB}
                    onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded shrink-0" style={{ background: PL }} />
                    )}
                    <p className="text-xs font-medium text-slate-700 line-clamp-2 flex-1">{item.title}</p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Now Running Movies */}
          <SectionCard icon={Play} iconColor="#BE185D" title="Running Movies">
            {nowMovies.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No movies listed</p>
            ) : (
              <ul>
                {nowMovies.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                    style={{ borderBottom: '1px solid #F8FAFC' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = PB}
                    onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                    {item.poster ? (
                      <img src={item.poster} alt="" className="w-8 h-10 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-10 rounded shrink-0" style={{ background: PL }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.language || '—'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Upcoming Events */}
          <SectionCard icon={Clock} iconColor="#7C3AED" title="Upcoming Events">
            {upcomingEvents.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No upcoming events</p>
            ) : (
              <ul>
                {upcomingEvents.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid #F8FAFC' }}
                    onClick={() => navigate(`/events/update/${item._id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.background = PB}
                    onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                    <div className="w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0 text-white"
                      style={{ background: `linear-gradient(135deg,#7C3AED,#6D28D9)` }}>
                      <span className="text-[10px] font-bold leading-none">
                        {item.startDate ? new Date(item.startDate).toLocaleDateString('en-IN', { day: '2-digit' }) : '?'}
                      </span>
                      <span className="text-[8px] uppercase leading-none opacity-80">
                        {item.startDate ? new Date(item.startDate).toLocaleDateString('en-IN', { month: 'short' }) : ''}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 truncate">{item.venue || '—'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl p-5 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h2 className="font-semibold text-slate-700 mb-4 text-sm">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Add News',        to: '/news/list',   icon: Newspaper,   color: '#2563EB', bg: '#DBEAFE' },
            { label: 'Add Job',         to: '/jobs/list',   icon: Briefcase,   color: '#16A34A', bg: '#DCFCE7' },
            { label: 'Add Event',       to: '/events/list', icon: CalendarDays, color: '#7C3AED', bg: '#EDE9FE' },
            { label: 'Add Update',      to: '/updates/list',icon: Bell,        color: '#D97706', bg: '#FEF3C7' },
            { label: 'Add Sports',      to: '/sports/list', icon: Trophy,      color: '#DC2626', bg: '#FEE2E2' },
          ].map((a) => {
            const Icon = a.icon
            return (
              <button key={a.to}
                onClick={() => navigate(a.to, { state: { openCreate: true } })}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-800 transition-all"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = PB; e.currentTarget.style.borderColor = PL }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: a.bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                </div>
                <span className="font-medium">{a.label}</span>
                <Plus className="w-3 h-3 ml-1 text-slate-400" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
