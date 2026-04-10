import { useState, useRef, useEffect } from 'react'
import {
  Search, X, Loader, Newspaper, Briefcase, CalendarDays, Trophy,
  MapPin, Hotel, Film, Bus, Tag, Bell, Megaphone, Heart, UtensilsCrossed,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { searchApi } from '../../services/api'
import { useDebounce } from '../../hooks/useDebounce'

const MODULE_META = {
  news:         { label: 'News',         icon: Newspaper,       path: (id) => `/news/update/${id}` },
  jobs:         { label: 'Jobs',         icon: Briefcase,       path: (id) => `/jobs/update/${id}` },
  events:       { label: 'Events',       icon: CalendarDays,    path: (id) => `/events/update/${id}` },
  sports:       { label: 'Sports',       icon: Trophy,          path: (id) => `/sports/update/${id}` },
  tourism:      { label: 'Tourism',      icon: MapPin,          path: (id) => `/tourism/update/${id}` },
  stays:        { label: 'Stays',        icon: Hotel,           path: (id) => `/stays/update/${id}` },
  movies:       { label: 'Movies',       icon: Film,            path: (id) => `/movies/update/${id}` },
  transport:    { label: 'Transport',    icon: Bus,             path: (id) => `/transport/update/${id}` },
  offers:       { label: 'Offers',       icon: Tag,             path: (id) => `/offers/update/${id}` },
  updates:      { label: 'Updates',      icon: Bell,            path: (id) => `/updates/update/${id}` },
  ads:          { label: 'Ads',          icon: Megaphone,       path: (id) => `/ads/update/${id}` },
  sponsorships: { label: 'Sponsorships', icon: Heart,           path: (id) => `/sponsorships/update/${id}` },
  foods:        { label: 'Foods',        icon: UtensilsCrossed, path: () => `/foods` },
  results:      { label: 'Results',      icon: Trophy,          path: (id) => `/results/update/${id}` },
}

export default function GlobalSearch() {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [open,    setOpen]    = useState(false)

  const debouncedQuery = useDebounce(query, 350)
  const navigate   = useNavigate()
  const ref        = useRef(null)
  const inputRef   = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) { setResults({}); return }
    setLoading(true)
    searchApi.search({ q: debouncedQuery })
      .then((r) => { setResults(r.data || {}); setOpen(true) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  const handleSelect = (module, id) => {
    const meta = MODULE_META[module]
    if (meta) navigate(meta.path(id))
    setOpen(false); setQuery(''); setResults({})
  }

  const clear = () => { setQuery(''); setResults({}); inputRef.current?.focus() }

  const hasResults  = Object.values(results).some((a) => a?.length > 0)
  const totalCount  = Object.values(results).reduce((s, a) => s + (a?.length || 0), 0)
  const showDropdown = open && query.length >= 2

  return (
    <div className="relative flex-1 max-w-xs sm:max-w-sm" ref={ref}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-white/60" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          autoComplete="off"
          onChange={(e) => { setQuery(e.target.value); if (e.target.value.length >= 2) setOpen(true) }}
          onFocus={() => { if (query.length >= 2) setOpen(true) }}
          onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); clear() } }}
          placeholder="Search anything…"
          className="w-full pl-9 pr-8 py-1.5 rounded-lg text-sm focus:outline-none transition-all placeholder:text-white/50"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#FFFFFF',
          }}
        />
        {query && (
          <button type="button" onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/20 transition-colors">
            <X className="w-3.5 h-3.5 text-white/60" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{
            background: '#FFFFFF',
            border: '1px solid #dce8fb',
            boxShadow: '0 16px 48px rgba(10,61,149,0.18)',
            maxHeight: '420px',
            overflowY: 'auto',
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader className="w-4 h-4 animate-spin" style={{ color: '#0a3d95' }} />
              <span className="text-sm text-slate-500">Searching…</span>
            </div>
          ) : !hasResults ? (
            <div className="py-10 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-200" />
              <p className="text-sm text-slate-400">No results for "<strong>{query}</strong>"</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide sticky top-0 bg-white"
                style={{ borderBottom: '1px solid #F1F5F9' }}>
                {totalCount} result{totalCount !== 1 ? 's' : ''} found
              </div>
              {Object.entries(results).map(([module, items]) => {
                if (!items?.length) return null
                const meta = MODULE_META[module]
                if (!meta) return null
                const Icon = meta.icon
                return (
                  <div key={module}>
                    <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                      style={{ background: '#eef3fd', color: '#0a3d95', borderBottom: '1px solid #dce8fb' }}>
                      {meta.label}
                    </div>
                    {items.slice(0, 5).map((item) => (
                      <button
                        key={item._id}
                        onClick={() => handleSelect(module, item._id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:text-slate-900 transition-colors text-left"
                        style={{ borderBottom: '1px solid #F8FAFC' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#eef3fd'}
                        onMouseLeave={(e) => e.currentTarget.style.background = ''}
                      >
                        <Icon className="w-4 h-4 shrink-0" style={{ color: '#0a3d95' }} />
                        <span className="flex-1 truncate font-medium">
                          {item.title || item.name || item.movieName || '—'}
                        </span>
                        {item.viewCount > 0 && (
                          <span className="text-xs text-slate-400 shrink-0">{item.viewCount} views</span>
                        )}
                      </button>
                    ))}
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
