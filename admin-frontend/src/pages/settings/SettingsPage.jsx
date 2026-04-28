import { useEffect, useState } from 'react'
import { settingsApi }         from '../../services/api'
import PageHeader              from '../../components/common/PageHeader'
import LoadingSpinner          from '../../components/common/LoadingSpinner'
import toast                   from 'react-hot-toast'
import { Settings }            from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const lbl  = 'block text-xs font-semibold uppercase tracking-wide mb-1 text-slate-500'
const inp  = 'w-full px-3 py-2 text-sm rounded-xl focus:outline-none transition-all text-slate-700'
const inpS = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
const focOn  = (e) => { e.target.style.borderColor = P;        e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const focOff = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

const LIMIT_FIELDS = [
  {
    group: 'News',
    items: [
      { key: 'maxImportantNewsPerCategory', label: 'Important News per Category',   hint: 'Max articles marked "Important" per news category' },
      { key: 'maxBreakingNews',             label: 'Breaking News Points (global)',  hint: 'Max points in the breaking news ticker' },
    ],
  },
  {
    group: 'Events',
    items: [
      { key: 'maxPopularEventsPerCategory', label: 'Popular Events per Category',   hint: 'Max events marked "Popular" per event category' },
      { key: 'maxInfluencerEvents',         label: 'Influencer Events (global)',     hint: 'Max influencer events shown globally' },
    ],
  },
  {
    group: 'Stays',
    items: [
      { key: 'maxTopStayPerCategory',       label: 'Top Stays per Category',         hint: 'Max stays marked "Top" per stay category' },
    ],
  },
  {
    group: 'Tourism',
    items: [
      { key: 'maxPopularTourism',           label: 'Popular Destinations (global)',  hint: 'Max tourist places marked "Popular" globally' },
    ],
  },
  {
    group: 'Foods',
    items: [
      { key: 'maxPopularFoodVarieties',     label: 'Popular Food Varieties (global)', hint: 'Max food varieties marked "Popular" globally' },
      { key: 'maxSweetsGlobally',           label: 'Sweets Entries (global)',         hint: 'Max number of sweets entries allowed' },
    ],
  },
  {
    group: 'Movies',
    items: [
      { key: 'maxUpcomingMovies',           label: 'Upcoming Movies (global)',       hint: 'Max movies with "Coming Soon" status' },
    ],
  },
  {
    group: 'Sports',
    items: [
      { key: 'maxUpcomingSports',           label: 'Upcoming Sports Events (global)', hint: 'Max upcoming sport events' },
    ],
  },
  {
    group: 'Instagram',
    items: [
      { key: 'maxInstagramPosts',           label: 'Manual Posts (global)',           hint: 'Max manual Instagram posts when not connected to API' },
    ],
  },
]

export default function SettingsPage() {
  const [limits,   setLimits]   = useState({})
  const [defaults, setDefaults] = useState({})
  const [values,   setValues]   = useState({})
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [dirty,    setDirty]    = useState(false)

  useEffect(() => {
    settingsApi.getLimits()
      .then((r) => {
        const { limits: l, defaults: d } = r.data?.data || {}
        setLimits(l || {})
        setDefaults(d || {})
        setValues(l || {})
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(key, val) {
    const n = val === '' ? '' : Math.max(1, parseInt(val) || 1)
    setValues((prev) => ({ ...prev, [key]: n }))
    setDirty(true)
  }

  async function handleSave() {
    for (const [key, val] of Object.entries(values)) {
      const n = parseInt(val)
      if (!Number.isFinite(n) || n < 1 || n > 9999) {
        toast.error(`"${key}" must be between 1 and 9999`)
        return
      }
    }
    setSaving(true)
    try {
      const r   = await settingsApi.updateLimits(values)
      const { limits: l } = r.data?.data || {}
      setLimits(l || {})
      setValues(l || {})
      setDirty(false)
      toast.success('Limits saved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save limits')
    } finally {
      setSaving(false)
    }
  }

  function handleReset(key) {
    setValues((prev) => ({ ...prev, [key]: defaults[key] }))
    setDirty(true)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        subtitle="Configure content limits for each module"
        icon={<Settings className="w-5 h-5" style={{ color: P }} />}
      />

      <div className="space-y-6">
        {LIMIT_FIELDS.map((group) => (
          <div
            key={group.group}
            style={{ background: '#FFFFFF', border: `1px solid ${PL}`, borderRadius: '16px', padding: '20px' }}
          >
            <p className="text-sm font-bold text-slate-700 mb-4" style={{ color: P }}>
              {group.group}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.items.map(({ key, label, hint }) => (
                <div key={key}>
                  <label htmlFor={key} className={lbl}>{label}</label>
                  <p className="text-[11px] text-slate-400 mb-1.5">{hint}</p>
                  <div className="flex gap-2 items-center">
                    <input
                      id={key}
                      name={key}
                      type="number"
                      min={1}
                      max={9999}
                      value={values[key] ?? defaults[key] ?? ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      onFocus={focOn}
                      onBlur={focOff}
                      className={inp}
                      style={inpS}
                    />
                    {values[key] !== defaults[key] && (
                      <button
                        type="button"
                        onClick={() => handleReset(key)}
                        className="text-[11px] whitespace-nowrap px-2.5 py-1.5 rounded-lg transition-colors"
                        style={{ background: PB, color: P, border: `1px solid ${PL}`, fontWeight: 600 }}
                        title={`Reset to default (${defaults[key]})`}
                      >
                        Reset ({defaults[key]})
                      </button>
                    )}
                  </div>
                  {limits[key] !== undefined && values[key] !== limits[key] && (
                    <p className="text-[10px] text-amber-500 mt-1">Unsaved — current: {limits[key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: P }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
