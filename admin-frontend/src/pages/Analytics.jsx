import Card, { CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const metrics = [
  { label: 'Page Views', value: '1.2M', change: '+18.3%', positive: true },
  { label: 'Unique Visitors', value: '438K', change: '+9.1%', positive: true },
  { label: 'Bounce Rate', value: '42.8%', change: '-3.2%', positive: true },
  { label: 'Avg. Session', value: '4m 12s', change: '+0.8%', positive: true },
]

const topPages = [
  { page: '/dashboard', views: 48200, change: '+12%', positive: true },
  { page: '/users', views: 31500, change: '+8%', positive: true },
  { page: '/analytics', views: 24800, change: '-2%', positive: false },
  { page: '/settings', views: 18900, change: '+5%', positive: true },
  { page: '/reports', views: 14200, change: '+22%', positive: true },
]

const trafficSources = [
  { source: 'Organic Search', value: 42, color: 'bg-indigo-500' },
  { source: 'Direct', value: 28, color: 'bg-violet-500' },
  { source: 'Social Media', value: 18, color: 'bg-sky-500' },
  { source: 'Referral', value: 12, color: 'bg-emerald-500' },
]

// Simple area chart using SVG
function AreaChart({ data, color = '#6366f1' }) {
  const max = Math.max(...data)
  const w = 100
  const h = 60
  const coords = data.map((p, i) => [
    (i / (data.length - 1)) * w,
    h - (p / max) * h * 0.9 - h * 0.05,
  ])
  const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
  const fill = `${d} L ${w} ${h} L 0 ${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Analytics() {
  const pageViewData = [65, 59, 80, 81, 56, 95, 72, 88, 76, 92, 85, 98]
  const visitorData = [28, 48, 40, 55, 42, 68, 50, 62, 58, 74, 65, 80]

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>Home</span><span>/</span>
        <span className="text-slate-900 font-medium">Analytics</span>
      </div>

      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Performance Overview</h2>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {['7d', '30d', '90d', '1y'].map((p, i) => (
            <button
              key={p}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                i === 1 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(m => (
          <Card key={m.label} hover>
            <p className="text-sm text-slate-500 font-medium">{m.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{m.value}</p>
            <p className={`text-sm mt-1 font-medium ${m.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              {m.change}
            </p>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Page Views" subtitle="Daily page views over last 30 days" />
          <AreaChart data={pageViewData} color="#6366f1" />
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-500 inline-block rounded" /> Page Views</span>
          </div>
        </Card>

        <Card>
          <CardHeader title="Unique Visitors" subtitle="Daily unique visitors over last 30 days" />
          <AreaChart data={visitorData} color="#8b5cf6" />
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-500 inline-block rounded" /> Unique Visitors</span>
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top pages */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Top Pages</h3>
            <p className="text-sm text-slate-500 mt-0.5">Most visited pages this month</p>
          </div>
          <div className="divide-y divide-slate-50">
            {topPages.map((p, i) => (
              <div key={p.page} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                <span className="text-sm text-slate-400 w-5 text-center font-medium">{i + 1}</span>
                <code className="text-sm text-slate-800 font-mono flex-1">{p.page}</code>
                <span className="text-sm font-semibold text-slate-900">{p.views.toLocaleString()}</span>
                <span className={`text-xs font-medium ${p.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {p.change}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Traffic sources */}
        <Card>
          <CardHeader title="Traffic Sources" />
          <div className="space-y-4">
            {trafficSources.map(s => (
              <div key={s.source}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700">{s.source}</span>
                  <span className="text-sm font-semibold text-slate-900">{s.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all duration-500`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
