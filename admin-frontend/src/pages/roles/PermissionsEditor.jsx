const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const MODULES = [
  'news', 'jobs', 'results', 'sports', 'foods', 'history', 'stays',
  'events', 'movies', 'transport', 'offers', 'tourism', 'realestate', 'updates',
  'ads', 'sponsorships', 'instagram', 'leads', 'company',
  'users', 'roles', 'settings',
]

const LEVELS = ['none', 'read', 'read_write', 'full']

const LEVEL_STYLE = {
  none:       { bg: '#F1F5F9', color: '#94A3B8', active: '#64748B' },
  read:       { bg: '#DBEAFE', color: '#1D4ED8', active: '#1D4ED8' },
  read_write: { bg: '#DCFCE7', color: '#15803D', active: '#15803D' },
  full:       { bg: '#FEF3C7', color: '#D97706', active: '#D97706' },
}

const LEVEL_LABEL = { none: 'None', read: 'Read', read_write: 'Read+Write', full: 'Full' }

export default function PermissionsEditor({ permissions, onChange }) {
  const setLevel = (mod, level) => onChange({ ...permissions, [mod]: level })

  const setAll = (level) => {
    const next = {}
    MODULES.forEach((m) => { next[m] = level })
    onChange(next)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: `1px solid ${PL}` }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ background: PB, borderBottom: `1px solid ${PL}` }}>
        <h3 className="text-sm font-bold text-slate-700">Module Permissions</h3>
        <div className="flex gap-1.5">
          {LEVELS.map((l) => (
            <button key={l} type="button" onClick={() => setAll(l)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg transition-all"
              style={{ background: LEVEL_STYLE[l].bg, color: LEVEL_STYLE[l].color, border: `1px solid ${LEVEL_STYLE[l].bg}` }}>
              All {LEVEL_LABEL[l]}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {MODULES.map((mod) => {
          const current = permissions[mod] || 'none'
          return (
            <div key={mod} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm font-medium text-slate-700 capitalize w-32">{mod}</span>
              <div className="flex gap-1">
                {LEVELS.map((level) => {
                  const s = LEVEL_STYLE[level]
                  const isActive = current === level
                  return (
                    <button key={level} type="button" onClick={() => setLevel(mod, level)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg transition-all"
                      style={{
                        background: isActive ? s.bg : '#F8FAFC',
                        color:      isActive ? s.active : '#94A3B8',
                        border:     isActive ? `1px solid ${s.bg}` : '1px solid #E2E8F0',
                        fontWeight: isActive ? 700 : 500,
                      }}>
                      {LEVEL_LABEL[level]}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
