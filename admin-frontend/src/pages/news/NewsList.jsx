import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Info, Tag, Star, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { newsApi } from '../../services/api'
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
  const navigate  = useNavigate()

  const [tab, setTab]                       = useState('articles')
  const [data, setData]                     = useState([])
  const [loading, setLoading]               = useState(true)
  const [page, setPage]                     = useState(1)
  const [totalPages, setTotalPages]         = useState(1)
  const [search, setSearch]                 = useState('')
  const [categories, setCategories]         = useState([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleteId, setDeleteId]             = useState(null)
  const [deleting, setDeleting]             = useState(false)
  const [togglingId, setTogglingId]         = useState(null)
  const debouncedSearch = useDebounce(search)

  const [formOpen,       setFormOpen]       = useState(false)
  const [formDefaults,   setFormDefaults]   = useState(null)
  const [formEditId,     setFormEditId]     = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching,   setFormFetching]   = useState(false)
  const [formDirty,      setFormDirty]      = useState(false)

  useEffect(() => {
    newsApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (location.state?.openCreate) { openCreate(); window.history.replaceState({}, '') }
  }, [location.state])

  const fetchData = useCallback(() => {
    setLoading(true)
    const isImportant = tab === 'important' ? true : false
    newsApi.getAll({ page, limit: 20, search: debouncedSearch, category: categoryFilter, isImportant })
      .then((r) => { setData(r.data.items || []); setTotalPages(r.data.totalPages || 1) })
      .catch(() => toast.error('Failed to load news'))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, categoryFilter, tab])

  useEffect(() => { fetchData() }, [fetchData])

  const switchTab = (t) => { setTab(t); setPage(1) }

  const handleToggleImportant = async (item) => {
    setTogglingId(item._id)
    try {
      await newsApi.update(item._id, { isImportant: !item.isImportant })
      toast.success(item.isImportant ? 'Moved to Articles' : 'Marked as Important')
      fetchData()
    } catch { toast.error('Failed to update') }
    finally { setTogglingId(null) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await newsApi.delete(deleteId); toast.success('Deleted'); setDeleteId(null); fetchData() }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = () => { setFormDefaults({}); setFormEditId(null); setFormDirty(false); setFormOpen(true) }

  const openEdit = async (id) => {
    setFormFetching(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false); setFormOpen(true)
    try { const r = await newsApi.getById(id); setFormDefaults(r.data) }
    catch { toast.error('Failed to load'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true)
    try {
      if (formEditId) { await newsApi.update(formEditId, formData); toast.success('News updated!') }
      else            { await newsApi.create(formData);             toast.success('News created!') }
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
      cell: ({ row }) => <span className="text-slate-500 text-xs">{row.original.category?.name || '—'}</span>,
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
    <div>
      <PageHeader
        title="News"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/news/categories')}
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
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by title…"
          className={`${inp} w-64`}
          style={inpStyle}
          onFocus={inpFocus}
          onBlur={inpBlur}
        />
        {categories.length > 0 && (
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            className={inp} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {tab === 'important' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs text-amber-700"
          style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
          <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Max 3 important news per category shown as main news on user side. Toggle off to move back to Articles.</span>
        </div>
      )}

      <DataTable columns={columns} data={data} isLoading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />

      <div className="flex items-center gap-4 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400"><Info className="w-3 h-3" /><span>Row actions:</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Pencil className="w-3 h-3" style={{ color: P }} /><span>Edit</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Trash2 className="w-3 h-3 text-red-400" /><span>Delete</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Eye className="w-3 h-3" /><span>View count</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Star className="w-3 h-3 text-amber-400" /><span>Toggle Important</span></div>
      </div>

      <ConfirmModal isOpen={!!deleteId} title="Delete News" message="This will permanently delete this news item." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />

      <FormModal isOpen={formOpen} onClose={handleCloseForm} title={formEditId ? 'Edit News' : 'Add News'} maxWidth="max-w-3xl">
        {(formFetching || formDefaults === null) ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
          </div>
        ) : (
          <NewsForm defaultValues={formDefaults} onSubmit={handleFormSubmit} loading={formSubmitting} onDirtyChange={setFormDirty} />
        )}
      </FormModal>
    </div>
  )
}
