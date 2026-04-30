import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Info, Tag, Star, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { newsApi, uploadApi } from '../../services/api'
import useNewsStore from '../../store/newsStore'
import useAnalyticsStore from '../../store/analyticsStore'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormModal from '../../components/common/FormModal'
import NewsForm from '../../components/forms/NewsForm'
import { formatDate, truncate } from '../../utils/helpers'
import { useDebounce } from '../../hooks/useDebounce'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'
const PAGE_SIZE = 20

function ToggleSwitch({ checked, onChange, loading }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={loading}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40"
      style={{ background: checked ? '#F59E0B' : '#CBD5E1' }}
      title={checked ? 'Mark as Article' : 'Mark as Important'}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5"
        style={{ marginLeft: checked ? '18px' : '2px' }}
      />
    </button>
  )
}

const TABS = [
  { key: 'articles',  label: 'Articles'      },
  { key: 'important', label: 'Important News' },
]

const inp = 'px-3 py-2 text-sm rounded-lg focus:outline-none transition-all'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }
const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

export default function NewsList() {
  const location = useLocation()
  const navigate = useNavigate()

  const [tab,            setTab]            = useState('articles')
  const [page,           setPage]           = useState(1)
  const [search,         setSearch]         = useState('')
  const [categories,     setCategories]     = useState([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleteId,       setDeleteId]       = useState(null)
  const [deleting,       setDeleting]       = useState(false)
  const [togglingId,           setTogglingId]           = useState(null)
  const [replaceOpen,          setReplaceOpen]          = useState(false)
  const [replaceCandidates,    setReplaceCandidates]    = useState([])
  const [replacePendingItem,   setReplacePendingItem]   = useState(null)
  const [replacingId,          setReplacingId]          = useState(null)
  const debouncedSearch = useDebounce(search)

  // Data from Zustand store — updated by useSSE in Layout automatically
  const { items: data, totalPages, loading, fetch } = useNewsStore()

  const { pageViews: analyticsPageViews, loaded: analyticsLoaded, fetch: fetchAnalytics } = useAnalyticsStore()
  useEffect(() => { if (!analyticsLoaded) fetchAnalytics() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const totalPageViews = analyticsPageViews['news'] || 0

  const [formOpen,       setFormOpen]       = useState(false)
  const [formDefaults,   setFormDefaults]   = useState(null)
  const [formEditId,     setFormEditId]     = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching,   setFormFetching]   = useState(false)
  const [formDirty,      setFormDirty]      = useState(false)
  const [reservedId,     setReservedId]     = useState(null)

  // Re-fetch via store on filter/tab/page change
   
  useEffect(() => {
    fetch({ page, limit: PAGE_SIZE, search: debouncedSearch, category: categoryFilter, isImportant: tab === 'important' ? 'true' : 'false' })
  }, [tab, page, debouncedSearch, categoryFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load categories once
  useEffect(() => {
    newsApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
  }, [])

  // Auto-open create form when navigated from Quick Actions
  useEffect(() => {
    if (location.state?.openCreate) { openCreate(); window.history.replaceState({}, '') }
  }, [location.state])  

  const switchTab = (t) => { setTab(t); setPage(1) }

  const handleToggleImportant = async (item) => {
    setTogglingId(item._id)
    try {
      await newsApi.update(item._id, { isImportant: !item.isImportant })
      toast.success(item.isImportant ? 'Moved to Articles' : 'Marked as Important')
      fetch()
    } catch (e) {
      // RULE 13 — max 3 important per category: show replace prompt
      if (e?.response?.data?.code === 'MAX_LIMIT_REACHED') {
        setReplaceCandidates(e.response.data.currentItems || [])
        setReplacePendingItem(item)
        setReplaceOpen(true)
      } else {
        toast.error(e?.response?.data?.message || 'Failed to update')
      }
    }
    finally { setTogglingId(null) }
  }

  const handleReplaceConfirm = async (replaceId) => {
    if (!replacePendingItem) return
    setReplacingId(replaceId)
    try {
      await newsApi.update(replacePendingItem._id, { isImportant: true, replaceId })
      toast.success('Marked as Important — replaced previous item')
      setReplaceOpen(false); setReplaceCandidates([]); setReplacePendingItem(null)
      fetch()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update')
    } finally { setReplacingId(null) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await newsApi.delete(deleteId); toast.success('Moved to Recycle Bin'); setDeleteId(null); fetch() }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = async () => {
    setFormEditId(null); setFormDirty(false); setReservedId(null)
    setFormDefaults({}); setFormOpen(true)  // open immediately — don't wait for reserveId
    try { const r = await uploadApi.reserveId('NEW'); setReservedId(r.data.data.id) }
    catch { toast.error('Failed to reserve ID — please try again'); setFormOpen(false) }
  }

  const openEdit = async (id) => {
    setFormFetching(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false); setFormOpen(true)
    try { const r = await newsApi.getById(id); setFormDefaults(r.data.data) }
    catch { toast.error('Failed to load'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true)
    try {
      if (formEditId) { await newsApi.update(formEditId, formData); toast.success('News updated!') }
      else            { await newsApi.create(reservedId ? { ...formData, _reservedId: reservedId } : formData); toast.success('News created!') }
      setFormOpen(false); setFormDirty(false); setReservedId(null)
      fetch()
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setFormSubmitting(false) }
  }

  const handleCloseForm = () => {
    if (formDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to close?')) return
    }
    setFormOpen(false); setFormDirty(false); setReservedId(null)
  }

  const columns = [
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
      cell: ({ getValue }) => <span className="font-medium text-slate-800">{truncate(getValue(), 55)}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const cat = categories.find((c) => c._id === row.original.category)
        return <span className="text-slate-500 text-xs">{cat?.name || '—'}</span>
      },
    },
    {
      accessorKey: 'cardViews',
      header: 'Card Views',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-slate-400 text-xs">
          <Eye className="w-3 h-3" />
          {row.original.cardViews ?? 0}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Published',
      cell: ({ getValue }) => (
        <span className="text-slate-500 text-xs">{formatDate(getValue())}</span>
      ),
    },
    {
      id: 'important',
      header: 'Important',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ToggleSwitch
            checked={!!row.original.isImportant}
            onChange={() => handleToggleImportant(row.original)}
            loading={togglingId === row.original._id}
          />
          {row.original.isImportant && <Star className="w-3.5 h-3.5 text-amber-400" />}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
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
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="News"
        pageViews={totalPageViews}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/news/manage')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all"
              style={{ background: PL, color: P, border: `1px solid ${PL}` }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#c8dafd'}
              onMouseLeave={(e) => e.currentTarget.style.background = PL}
            >
              <Tag className="w-4 h-4" /> Categories
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}
            >
              <Plus className="w-4 h-4" /> Add News
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: PL }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all"
            style={tab === t.key
              ? { background: '#FFFFFF', color: P, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { background: 'transparent', color: '#64748B' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div>
          <label htmlFor="search-news" className="sr-only">Search news</label>
          <input
            id="search-news" name="search" autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by title…"
            className={`${inp} w-full sm:w-64`}
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          />
        </div>
        {categories.length > 0 && (
          <div>
            <label htmlFor="filter-category-news" className="sr-only">Filter by category</label>
            <select id="filter-category-news" name="filter-category"
              value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
              className={inp} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {tab === 'important' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs text-amber-700"
          style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
          <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Max 3 important news per category shown as main news on user side. Toggle off to move back to Articles.</span>
        </div>
      )}

      <DataTable
        columns={columns}
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
        <div className="flex items-center gap-1 text-xs text-slate-400"><Eye className="w-3 h-3" /><span>Card views</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Star className="w-3 h-3 text-amber-400" /><span>Toggle Important</span></div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete News"
        message="This will move this news item to the Recycle Bin. You can restore it within 15 days."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      <FormModal isOpen={formOpen} onClose={handleCloseForm} title={formEditId ? 'Edit News' : 'Add News'} maxWidth="max-w-3xl">
        {(formFetching || formDefaults === null) ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
          </div>
        ) : (
          <NewsForm defaultValues={formDefaults} onSubmit={handleFormSubmit} loading={formSubmitting} onDirtyChange={setFormDirty} contentId={formEditId || reservedId} />
        )}
      </FormModal>

      {/* RULE 13 — Replace prompt for isImportant toggle max 3/category */}
      {replaceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Max Important Reached</h3>
            <p className="text-sm text-slate-500 mb-4">
              This category already has 3 Important articles. Choose one to replace:
            </p>
            <div className="flex flex-col gap-2 mb-5">
              {replaceCandidates.map((c) => (
                <button
                  key={c._id}
                  onClick={() => handleReplaceConfirm(c._id)}
                  disabled={!!replacingId}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all"
                  style={{ borderColor: replacingId === c._id ? P : '#E2E8F0', background: replacingId === c._id ? PB : '#FAFAFA' }}
                >
                  {c.thumbnail && <img src={c.thumbnail} className="w-10 h-8 object-cover rounded-lg shrink-0" alt="" />}
                  <span className="text-sm font-medium text-slate-700 line-clamp-2">{c.title}</span>
                  {replacingId === c._id && (
                    <div className="ml-auto w-4 h-4 rounded-full animate-spin shrink-0" style={{ border: `2px solid ${PL}`, borderTopColor: P }} />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setReplaceOpen(false); setReplaceCandidates([]); setReplacePendingItem(null) }}
              className="w-full py-2 text-sm font-semibold rounded-xl text-slate-500 hover:text-slate-700 transition-colors"
              style={{ background: '#F1F5F9' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
