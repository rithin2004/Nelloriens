import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Trophy, Newspaper, Tag, Eye, Info, Layers } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { sportsApi, uploadApi } from '../../services/api'
import useSportsStore from '../../store/sportsStore'
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
const PAGE_SIZE = 20

const TABS = [
  { key: 'entry',    label: 'Sports Entries',  icon: Layers    },
  { key: 'upcoming', label: 'Upcoming Sports',  icon: Trophy    },
  { key: 'article',  label: 'News & Articles',  icon: Newspaper },
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
  const [tab,        setTab]        = useState('entry')
  const [categories, setCategories] = useState([])
  const [search,     setSearch]     = useState('')
  const [catFilter,  setCatFilter]  = useState('')
  const [page,       setPage]       = useState(1)
  const debouncedSearch = useDebounce(search)

  const { items: data, totalPages, loading, fetch } = useSportsStore()

  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [formOpen,       setFormOpen]       = useState(false)
  const [formDefaults,   setFormDefaults]   = useState(null)
  const [formEditId,     setFormEditId]     = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching,   setFormFetching]   = useState(false)
  const [formDirty,      setFormDirty]      = useState(false)
  const [reservedId,     setReservedId]     = useState(null)

  useEffect(() => {
    fetch({ page, limit: PAGE_SIZE, search: debouncedSearch, category: catFilter, type: tab })
  }, [tab, page, debouncedSearch, catFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    sportsApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
  }, [])

  const switchTab = (t) => { setTab(t); setPage(1); setSearch(''); setCatFilter('') }

  const handleDelete = async () => {
    setDeleting(true)
    try { await sportsApi.delete(deleteId); toast.success('Moved to Recycle Bin'); setDeleteId(null) }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = async () => {
    setFormEditId(null); setFormDirty(false)
    try { const r = await uploadApi.reserveId('SPT'); setReservedId(r.data.data.id) }
    catch { toast.error('Failed to reserve ID — please try again'); return }
    setFormDefaults({ type: tab }); setFormOpen(true)
  }
  const openEdit = async (id) => {
    setFormFetching(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false); setFormOpen(true)
    try { const r = await sportsApi.getById(id); setFormDefaults(r.data.data) }
    catch { toast.error('Failed to load'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true)
    try {
      if (formEditId) { await sportsApi.update(formEditId, formData); toast.success('Updated!') }
      else            { await sportsApi.create(reservedId ? { ...formData, _reservedId: reservedId } : formData); toast.success('Created!') }
      setFormOpen(false); setFormDirty(false); setReservedId(null)
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setFormSubmitting(false) }
  }

  const handleCloseForm = () => {
    if (formDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return
    setFormOpen(false); setFormDirty(false); setReservedId(null)
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

  // Tab 1 — Sports Entries columns
  const entryColumns = [
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
      cell: ({ getValue }) => <span className="font-semibold text-slate-800">{truncate(getValue() || '', 50)}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <span className="text-slate-500 text-xs">{row.original.category?.name || row.original.category || '—'}</span>,
    },
    {
      accessorKey: 'pageViews',
      header: 'Views',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-slate-400 text-xs">
          <Eye className="w-3 h-3" /> {row.original.pageViews ?? 0}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Added',
      cell: ({ getValue }) => <span className="text-slate-500 text-xs">{formatDate(getValue())}</span>,
    },
    { id: 'actions', header: '', cell: ({ row }) => actionButtons(row) },
  ]

  // Tab 2 — Upcoming Sports columns
  const upcomingColumns = [
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
      cell: ({ getValue }) => <span className="font-semibold text-slate-800">{truncate(getValue() || '', 45)}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <span className="text-slate-500 text-xs">{row.original.category?.name || row.original.category || '—'}</span>,
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
      header: 'Status',
      cell: ({ getValue }) => <MatchStatusBadge status={getValue()} />,
    },
    { id: 'actions', header: '', cell: ({ row }) => actionButtons(row) },
  ]

  // Tab 3 — News & Articles columns
  const articleColumns = [
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
      cell: ({ getValue }) => <span className="font-semibold text-slate-800">{truncate(getValue() || '', 55)}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <span className="text-slate-500 text-xs">{row.original.category?.name || row.original.category || '—'}</span>,
    },
    {
      accessorKey: 'pageViews',
      header: 'Views',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-slate-400 text-xs">
          <Eye className="w-3 h-3" /> {row.original.pageViews ?? 0}
        </span>
      ),
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published',
      cell: ({ row }) => (
        <span className="text-slate-500 text-xs">{formatDate(row.original.publishedAt || row.original.createdAt)}</span>
      ),
    },
    { id: 'actions', header: '', cell: ({ row }) => actionButtons(row) },
  ]

  const tabColumns = { entry: entryColumns, upcoming: upcomingColumns, article: articleColumns }
  const tabTitles  = { entry: 'Add Entry', upcoming: 'Add Upcoming Sport', article: 'Add Article' }
  const formTitle  = formEditId
    ? (tab === 'entry' ? 'Edit Entry' : tab === 'upcoming' ? 'Edit Upcoming Sport' : 'Edit Article')
    : tabTitles[tab]

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
              <Plus className="w-4 h-4" /> {tabTitles[tab]}
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

      {/* Info banner */}
      {tab === 'entry' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: '#EDE9FE', border: '1px solid #DDD6FE', color: '#6D28D9' }}>
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span>Sports entries with photos, descriptions, and live score links.</span>
        </div>
      )}
      {tab === 'upcoming' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E' }}>
          <Trophy className="w-3.5 h-3.5 shrink-0" />
          <span>Upcoming and live sport events — add schedules, venues, and live stream links.</span>
        </div>
      )}
      {tab === 'article' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: PB, border: `1px solid ${PL}`, color: P }}>
          <Newspaper className="w-3.5 h-3.5 shrink-0" />
          <span>Sport-related news articles and match reports.</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div>
          <label htmlFor="search-sports" className="sr-only">Search sports</label>
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
        </div>
        {categories.length > 0 && (
          <div>
            <label htmlFor="filter-category-sports" className="sr-only">Filter by sport category</label>
            <select id="filter-category-sports" name="filter-category"
              value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1) }}
              className={inp} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <DataTable
        columns={tabColumns[tab]}
        data={data}
        isLoading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <div className="flex items-center gap-4 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400"><Info className="w-3 h-3" /><span>Row actions:</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Pencil className="w-3 h-3" style={{ color: P }} /><span>Edit</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Trash2 className="w-3 h-3 text-red-400" /><span>Delete (moves to Recycle Bin)</span></div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Sport"
        message="This will move this item to the Recycle Bin. You can restore it within 15 days."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      <FormModal isOpen={formOpen} onClose={handleCloseForm} title={formTitle} maxWidth="max-w-2xl">
        {(formFetching || formDefaults === null) ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
          </div>
        ) : (
          <SportForm
            defaultValues={formDefaults}
            onSubmit={handleFormSubmit}
            loading={formSubmitting}
            onDirtyChange={setFormDirty}
            contentId={formEditId || reservedId}
          />
        )}
      </FormModal>
    </div>
  )
}
