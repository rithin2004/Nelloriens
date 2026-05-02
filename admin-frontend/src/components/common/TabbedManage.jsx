/**
 * TabbedManage — wraps multiple CategoryManager instances in a tab UI.
 *
 * Props:
 *   title   — page heading
 *   tabs    — array of { label, content: <ReactNode> }
 */
import { useState } from 'react'
import PageHeader   from './PageHeader'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

export default function TabbedManage({ title, tabs = [], backTo }) {
  const [active, setActive] = useState(0)

  return (
    <div className="animate-fade-in">
      <PageHeader title={title} backTo={backTo} />

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 flex-wrap" style={{ borderBottom: `2px solid ${PL}` }}>
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(i)}
            className="px-4 py-2 text-sm font-semibold rounded-t-lg transition-all"
            style={{
              background:   active === i ? P : 'transparent',
              color:        active === i ? '#FFFFFF' : '#64748B',
              borderBottom: active === i ? `2px solid ${P}` : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div>
        {tabs[active]?.content}
      </div>
    </div>
  )
}
