const variants = {
  published:   { bg: '#DCFCE7', color: '#15803D' },
  active:      { bg: '#DCFCE7', color: '#15803D' },
  now_showing: { bg: '#DCFCE7', color: '#15803D' },
  draft:       { bg: '#FEF9C3', color: '#A16207' },
  pending:     { bg: '#FEF9C3', color: '#A16207' },
  archived:    { bg: '#F1F5F9', color: '#64748B' },
  expired:     { bg: '#F1F5F9', color: '#64748B' },
  ended:       { bg: '#F1F5F9', color: '#64748B' },
  inactive:    { bg: '#F1F5F9', color: '#64748B' },
  cancelled:   { bg: '#FEE2E2', color: '#B91C1C' },
  live:        { bg: '#FEE2E2', color: '#B91C1C' },
  coming_soon: { bg: '#DBEAFE', color: '#1D4ED8' },
  upcoming:    { bg: '#DBEAFE', color: '#1D4ED8' },
  completed:   { bg: '#EDE9FE', color: '#6D28D9' },
  // Leads statuses
  new:         { bg: '#DBEAFE', color: '#1D4ED8' },
  read:        { bg: '#F1F5F9', color: '#64748B' },
  replied:     { bg: '#DCFCE7', color: '#15803D' },
}

export default function StatusBadge({ status }) {
  const v = variants[status] || { bg: '#F1F5F9', color: '#64748B' }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: v.bg, color: v.color }}
    >
      {status?.replace(/_/g, ' ')}
    </span>
  )
}
