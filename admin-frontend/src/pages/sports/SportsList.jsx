import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Trophy, Newspaper, Tag, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { sportsApi } from '../../services/api'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormModal from '../../components/common/FormModal'
import SportForm from '../../components/forms/SportForm'
import { formatDate, truncate } from '../../utils/helpers'
import { useDebounce } from '../../hooks/useDebounce'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const TABS = [
  { key: 'events',   label: 'Upcoming Sport Events', icon: Trophy    },
  { key: 'articles', label: 'News & Articles',        icon: Newspaper },
]

const inp = 'px-3 py-2 text-sm rounded-lg focus:outline-none transition-all'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }
const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

function MatchStatusBadge({ status }) {
  const map = {
    upcoming:  { bg: '#DBEAFE', color: '#1D4ED8', label: 'Upcoming' },
    live:      { bg: '#DCFCE7', color: '#15803D', label: '● Live'   },
    completed: { bg: '#F1F5F9', color: '#64748B', label: 'Completed' },
  }
  const s = map[status] || { bg: '#F1F5F9', color: '#64748B', label: status }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export default function SportsList() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('events')

  const [categories, setCategories] = useState([])
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [data, setData]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [deleteId, setDeleteId]     = useState(null)
  const [deleting, setDeleting]     = useState(false)
  const debouncedSearch = useDebounce(search)

  const [formOpen,       setFormOpen]       = useState(false)
  const [formDefaults,   setFormDefaults]   = useState(null)
  const [formEditId,     setFormEditId]     = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching,   setFormFetching]   = useState(false)
  const [formDirty,      setFormDirty]      = useState(false)

  useEffect(() => {
    sportsApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  }, [])

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = { page, limit: 20, search: debouncedSearch }
    if (catFilter) params.sportType = catFilter
    if (tab === 'events')   params.matchStatus = 'upcoming,live'
    if (tab === 'articles') params.matchStatus = 'completed'
    sportsApi.getAll(params)
      .then((r) => { setData(r.data.items || []); setTotalPages(r.data.totalPages || 1) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, catFilter, tab])

  useEffect(() => { fetchData() }, [fetchData])

  const switchTab = (t) => { setTab(t); setPage(1) }

  const handleDelete = async () => {
    setDeleting(true)
    try { await sportsApi.delete(deleteId); toast.success('Deleted'); setDeleteId(null); fetchData() }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = () => { setFormDefaults({}); setFormEditId(null); setFormDirty(false); setFormOpen(true) }
  const openEdit   = async (id) => {
    setFormFetching(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false); setFormOpen(true)
    try { const r = await sportsApi.getById(id); setFormDefaults(r.data) }
    catch { toast.error('Failed to load'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true)
    try {
      if (formEditId) { await sportsApi.update(formEditId, formData); toast.success('Updated!') }
      else            { await sportsApi.create(formData);             toast.success('Created!') }
      setFormOpen(false); setFormDirty(false); fetchData()
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setFormSubmitting(false) }
  }

  const handleCloseForm = () => {
    if (formDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to close?')) return
    }
    setFormOpen(false); setFormDirty(false)
  }

  const actionButtons = (row) => (
    <div className="flex gap-1">
      <button onClick={() => openEdit(row.original._id)}
        className="p-1.5 rounded-lg text-slate-400 transition-colors"
        onMouseEnter={(e) => { e.currentTarget.style.color = P; e.currentTarget.style.background = PB }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
        <Pencil className="w-4 h-4" />
      </button>
      <button onClick={() => setDeleteId(row.original._id)}
        className="p-1.5 rounded-lg text-slate-400 transition-colors"
        onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEE2E2' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )

  const eventsColumns = [
    {
      accessorKey: 'thumbnail',
      header: '',
      cell: ({ row }) => row.original.thumbnail
        ? <img src={row.original.thumbnail} className="w-10 h-8 object-cover rounded-lg" alt="" />
        : <div className="w-10 h-8 rounded-lg bg-slate-100" />,
    },
    {
      accessorKey: 'title',
      header: 'Event',
      cell: ({ getValue }) => <span className="font-semibold text-slate-800">{truncate(getValue(), 50)}</span>,
    },
    {
      accessorKey: 'sportType',
      header: 'Sport',
      cell: ({ row }) => <span className="text-slate-500 text-xs">{row.original.sportType?.name || row.original.sportType || '—'}</span>,
    },
    {
      accessorKey: 'matchDateTime',
      header: 'Date & Time',
      cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() ? formatDate(getValue()) : '—'}</span>,
    },
    {
      accessorKey: 'venue',
      header: 'Venue',
      cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span>,
    },
    {
      accessorKey: 'matchStatus',
      header: 'Match Status',
      cell: ({ getValue }) => <MatchStatusBadge status={getValue()} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => actionButtons(row),
    },
  ]

  const articlesColumns = [
    {
      accessorKey: 'thumbnail',
      header: '',
      cell: ({ row }) => row.original.thumbnail
        ? <img src={row.original.thumbnail} className="w-10 h-8 object-cover rounded-lg" alt="" />
        : <div className="w-10 h-8 rounded-lg bg-slate-100" />,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ getValue }) => <span className="font-semibold text-slate-800">{truncate(getValue(), 55)}</span>,
    },
    {
      accessorKey: 'sportType',
      header: 'Sport',
      cell: ({ row }) => <span className="text-slate-500 text-xs">{row.original.sportType?.name || row.original.sportType || '—'}</span>,
    },
    {
      accessorKey: 'viewCount',
      header: 'Views',
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1 text-slate-400 text-xs">
          <Eye className="w-3 h-3" />
          {getValue() ?? 0}
        </span>
      ),
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published',
      cell: ({ row }) => {
        const pubAt = row.original.publishedAt || row.original.createdAt
        const isScheduled = pubAt && new Date(pubAt) > new Date()
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-500 text-xs">{formatDate(pubAt)}</span>
            {isScheduled && (
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded w-fit" style={{ background: '#FEF3C7', color: '#92400E' }}>
                Scheduled
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => actionButtons(row),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Sports"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/sports/categories')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all"
              style={{ background: PL, border: `1px solid ${PL}`, color: P }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#c8dafd'}
              onMouseLeave={(e) => e.currentTarget.style.background = PL}
            >
              <Tag className="w-4 h-4" /> Sport Categories
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}
            >
              <Plus className="w-4 h-4" /> Add Sport
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: PL }}>
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-all"
              style={tab === t.key
                ? { background: '#FFFFFF', color: P, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { background: 'transparent', color: '#64748B' }}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          id="search-sports" name="search" autoComplete="off"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search…"
          className={`${inp} w-56`}
          style={inpStyle}
          onFocus={inpFocus}
          onBlur={inpBlur}
        />
        {categories.length > 0 && (
          <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1) }}
            className={inp} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}>
            <option value="">All Sports</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {tab === 'events' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: '#EDE9FE', border: '1px solid #DDD6FE', color: '#6D28D9' }}>
          <Trophy className="w-3.5 h-3.5 shrink-0" />
          <span>Upcoming and live sport events — filter by sport type, add schedules and live stream links.</span>
        </div>
      )}
      {tab === 'articles' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: PB, border: `1px solid ${PL}`, color: P }}>
          <Newspaper className="w-3.5 h-3.5 shrink-0" />
          <span>Completed match reports and sport-related news articles.</span>
        </div>
      )}

      <DataTable
        columns={tab === 'events' ? eventsColumns : articlesColumns}
        data={data}
        isLoading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ConfirmModal isOpen={!!deleteId} title="Delete Sport" message="This will permanently delete this item." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />

      <FormModal isOpen={formOpen} onClose={handleCloseForm} title={formEditId ? 'Edit Sport' : 'Add Sport'} maxWidth="max-w-2xl">
        {(formFetching || formDefaults === null) ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
          </div>
        ) : (
          <SportForm defaultValues={formDefaults} onSubmit={handleFormSubmit} loading={formSubmitting} onDirtyChange={setFormDirty} />
        )}
      </FormModal>
    </div>
  )
}
