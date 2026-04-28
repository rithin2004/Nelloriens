import { useEffect, useState } from 'react'
import { leadsApi, companyApi } from '../../services/api'
import { useDebounce } from '../../hooks/useDebounce'
import useLeadsStore from '../../store/leadsStore'
import PageHeader from '../../components/common/PageHeader'
import ConfirmModal from '../../components/common/ConfirmModal'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  Search, Trash2, Eye, X, Mail, Phone, MessageSquare,
  Calendar, Filter, Inbox, Download,
} from 'lucide-react'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

// RULE 23 — Status workflow: new → contacted → resolved → closed
const STATUS_OPTIONS = [
  { value: '',           label: 'All Statuses' },
  { value: 'new',        label: 'New'       },
  { value: 'contacted',  label: 'Contacted' },
  { value: 'resolved',   label: 'Resolved'  },
  { value: 'closed',     label: 'Closed'    },
]

const STATUS_STYLE = {
  new:       { bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6' },
  contacted: { bg: '#FEF3C7', color: '#B45309', dot: '#F59E0B' },
  resolved:  { bg: '#DCFCE7', color: '#15803D', dot: '#22C55E' },
  closed:    { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
}

function StatusDot({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.new
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {status || 'new'}
    </span>
  )
}

function LeadDetailPopup({ lead, onClose, onStatusChange, onDelete }) {
  const [updating, setUpdating] = useState(false)

  const handleStatus = async (status) => {
    setUpdating(true)
    try {
      await leadsApi.update(lead._id, { status })
      toast.success('Status updated')
      onStatusChange(lead._id, status)
    } catch { toast.error('Failed to update') }
    finally { setUpdating(false) }
  }

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl animate-slide-up overflow-hidden"
        style={{ background: '#FFFFFF', border: `1px solid ${PL}`, boxShadow: `0 24px 64px rgba(10,61,149,0.15)` }}
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${PL}`, background: PB }}>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800">Lead Details</h3>
            <StatusDot status={lead.status || 'new'} />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
                <span className="text-sm font-bold text-white">{lead.name?.[0]?.toUpperCase() || '?'}</span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Name</p>
                <p className="text-sm font-medium text-slate-800">{lead.name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Mail className="w-4 h-4 shrink-0 text-blue-500" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm font-medium text-slate-800 truncate">{lead.email || '—'}</p>
              </div>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <Phone className="w-4 h-4 shrink-0 text-green-600" />
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-sm font-medium text-slate-800">{lead.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Calendar className="w-4 h-4 shrink-0 text-amber-500" />
              <div>
                <p className="text-xs text-slate-400">Received</p>
                <p className="text-sm font-medium text-slate-800">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : '—'}
                </p>
              </div>
            </div>
          </div>

          {lead.subject && (
            <div className="p-3 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <p className="text-xs mb-1 text-slate-400">Subject</p>
              <p className="text-sm font-medium text-slate-800">{lead.subject}</p>
            </div>
          )}

          <div className="p-3 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <p className="text-xs mb-2 flex items-center gap-1 text-slate-400">
              <MessageSquare className="w-3 h-3" /> Message
            </p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{lead.message || '—'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">Mark as</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.filter(o => o.value).map(({ value, label }) => {
                const isActive = (lead.status || 'new') === value
                const s = STATUS_STYLE[value]
                return (
                  <button key={value} onClick={() => handleStatus(value)}
                    disabled={updating || isActive}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-60"
                    style={isActive
                      ? { background: s.bg, color: s.color, border: `1px solid ${s.dot}40` }
                      : { background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }
                    }>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex justify-between items-center"
          style={{ borderTop: `1px solid ${PL}`, background: PB }}>
          <button onClick={() => onDelete(lead._id)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            style={{ border: '1px solid #FECACA' }}>
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <button onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            style={{ border: '1px solid #E2E8F0' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Export helpers ─────────────────────────────────────────────────────────────
function exportCSV(data) {
  const headers = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Received']
  const rows = data.map((l) => [
    l.name || '',
    l.email || '',
    l.phone || '',
    l.subject || '',
    (l.message || '').replace(/\n/g, ' '),
    l.status || 'new',
    l.createdAt ? new Date(l.createdAt).toLocaleString() : '',
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `leads_${new Date().toISOString().slice(0,10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}

function exportPDF(data, companyName = 'Admin') {
  const rows = data.map((l) => `
    <tr>
      <td>${l.name || '—'}</td>
      <td>${l.email || '—'}</td>
      <td>${l.phone || '—'}</td>
      <td>${l.subject || '—'}</td>
      <td>${(l.message || '—').slice(0, 100)}</td>
      <td>${l.status || 'new'}</td>
      <td>${l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '—'}</td>
    </tr>`).join('')

  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html><html><head><title>Leads Export</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; }
      h2 { color: #0a3d95; margin-bottom: 4px; }
      p { color: #64748B; margin-bottom: 16px; font-size: 10px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #0a3d95; color: white; padding: 8px 6px; text-align: left; font-size: 10px; }
      td { padding: 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
      tr:nth-child(even) td { background: #eef3fd; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <h2>${companyName} — Leads Report</h2>
    <p>Exported on ${new Date().toLocaleString()} · Total: ${data.length} leads</p>
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Subject</th><th>Message</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <script>window.onload = () => { window.print() }</script>
    </body></html>`)
  win.document.close()
}

const PAGE_SIZE = 20

// ── Main Component ─────────────────────────────────────────────────────────────
export default function LeadsList() {
  const [companyName, setCompanyName] = useState('Admin')
  const [page,       setPage]         = useState(1)
  const [search,     setSearch]       = useState('')
  const [status,     setStatus]       = useState('')
  const [dateFrom,   setDateFrom]     = useState('')
  const [dateTo,     setDateTo]       = useState('')
  const [selectedLead, setSelectedLead] = useState(null)
  const [deleteId,   setDeleteId]     = useState(null)
  const [deleting,   setDeleting]     = useState(false)
  const [exporting,  setExporting]    = useState(false)
  const debouncedSearch = useDebounce(search)

  // Data from Zustand store — updated by useSSE in Layout automatically
  const { items: data, total, totalPages, loading, fetch } = useLeadsStore()

   
  useEffect(() => {
    fetch({ page, limit: PAGE_SIZE, search: debouncedSearch, status, dateFrom, dateTo })
  }, [page, debouncedSearch, status, dateFrom, dateTo]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    companyApi.get().then((r) => { if (r.data?.name) setCompanyName(r.data.name) }).catch(() => {})
  }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await leadsApi.delete(deleteId)
      toast.success('Lead deleted')
      setDeleteId(null)
      setSelectedLead(null)
      fetch()
    }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const handleStatusChange = (id, newStatus) => {
    // Optimistic update in the detail popup only — SSE will re-fetch the list
    if (selectedLead?._id === id) setSelectedLead((p) => ({ ...p, status: newStatus }))
  }

  const handleExport = async (format) => {
    setExporting(true)
    try {
      // Fetch all matching records (no pagination) for export
      const r = await leadsApi.getAll({
        page: 1, limit: 10000,
        search: debouncedSearch, status, dateFrom, dateTo,
      })
      const exportData = r.data.data || []
      if (format === 'csv') exportCSV(exportData)
      else exportPDF(exportData, companyName)
    } catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  const clearFilters = () => { setSearch(''); setStatus(''); setDateFrom(''); setDateTo(''); setPage(1) }
  const hasFilters = search || status || dateFrom || dateTo

  const inp = 'px-3 py-2 text-sm rounded-lg focus:outline-none transition-all text-slate-700'
  const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
  const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
  const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Leads"
        subtitle={total > 0 ? `${total} total submissions` : undefined}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting || data.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-40"
              style={{ background: PL, color: P, border: `1px solid ${PL}` }}
              onMouseEnter={(e) => { if (!exporting) e.currentTarget.style.background = '#c8dafd' }}
              onMouseLeave={(e) => e.currentTarget.style.background = PL}
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting || data.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-40"
              style={{ background: '#EDE9FE', color: '#6D28D9', border: '1px solid #DDD6FE' }}
              onMouseEnter={(e) => { if (!exporting) e.currentTarget.style.background = '#DDD6FE' }}
              onMouseLeave={(e) => e.currentTarget.style.background = '#EDE9FE'}
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <label htmlFor="search-leads" className="sr-only">Search leads</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="search-leads" name="search" autoComplete="off"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search name, email, message..."
            className="pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none w-full sm:w-64 transition-all text-slate-700"
            style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
          />
        </div>

        <div className="relative">
          <label htmlFor="filter-status-leads" className="sr-only">Filter by status</label>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-slate-400" />
          <select id="filter-status-leads" name="status"
            value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="pl-8 pr-3 py-2 text-sm rounded-lg focus:outline-none transition-all text-slate-700"
            style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}>
            {STATUS_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="filter-date-from" className="sr-only">From date</label>
          <input id="filter-date-from" name="dateFrom" type="date"
            value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className={inp} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur} />
        </div>

        <div>
          <label htmlFor="filter-date-to" className="sr-only">To date</label>
          <input id="filter-date-to" name="dateTo" type="date"
            value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className={inp} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur} />
        </div>

        {hasFilters && (
          <button onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            style={{ border: '1px solid #E2E8F0' }}>
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-white"
          style={{ border: '1px solid #E2E8F0' }}>
          <Inbox className="w-10 h-10 mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No leads yet</p>
          <p className="text-xs mt-1 text-slate-400">
            {hasFilters ? 'Try clearing filters' : 'Contact form submissions will appear here'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: PB, borderBottom: `1px solid ${PL}` }}>
                <tr>
                  {['Name', 'Email', 'Subject', 'Status', 'Received', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3 whitespace-nowrap text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((lead) => (
                  <tr key={lead._id}
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid #F1F5F9' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = PB}
                    onMouseLeave={(e) => e.currentTarget.style.background = ''}
                    onClick={() => setSelectedLead(lead)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
                          {lead.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-slate-800">{lead.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{lead.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-48 truncate">{lead.subject || (lead.message?.slice(0, 40) + '...') || '—'}</td>
                    <td className="px-4 py-3"><StatusDot status={lead.status || 'new'} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelectedLead(lead)}
                          className="p-1.5 rounded-lg text-slate-400 transition-colors"
                          onMouseEnter={(e) => { e.currentTarget.style.color = P; e.currentTarget.style.background = PB }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}
                          title="View details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(lead._id)}
                          className="p-1.5 rounded-lg text-slate-400 transition-colors"
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEE2E2' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}
                          title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
        </div>
      )}

      {data.length > 0 && (
        <p className="text-xs text-slate-400 mt-3 px-1">
          Click a row to view details &amp; update status. Export fetches all leads matching current filters.
        </p>
      )}

      {selectedLead && (
        <LeadDetailPopup
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={handleStatusChange}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Lead"
        message="This will permanently delete this lead submission."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  )
}
