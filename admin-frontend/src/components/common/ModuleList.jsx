/**
 * ModuleList — RULE 7
 *
 * Shared list-page component for content modules.
 * Receives a Zustand store via the `store` prop.
 * Calls store.fetch(params) to load data — the store caches the last params
 * so that SSE-triggered re-fetches (from useSSE in Layout) preserve the
 * user's current page, search, and filters automatically.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Pencil, Trash2, Info, Eye, MousePointerClick } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from './PageHeader'
import DataTable from './DataTable'
import ConfirmModal from './ConfirmModal'
import FormModal from './FormModal'
import { formatDate, truncate } from '../../utils/helpers'
import { useDebounce } from '../../hooks/useDebounce'
import { uploadApi } from '../../services/api'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const PAGE_SIZE = 20

const toSingular = (str) => {
  if (str.endsWith('ies')) return str.slice(0, -3) + 'y'
  if (/[^s]s$/.test(str)) return str.slice(0, -1)
  return str
}

export default function ModuleList({
  title,
  store,                 // Zustand store hook for this module
  createPath,
  editPath,
  api,
  extraColumns = [],
  titleKey = 'title',
  FormComponent,
  formModalTitle,
  extraFilters = [],
  headerExtra,
  idPrefix,
  hideCardViews = false,
  showImpressions = false,
  showClicks = false,
  showTouches = false,
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const [page,            setPage]            = useState(1)
  const [search,          setSearch]          = useState('')
  const [extraFilterVals, setExtraFilterVals] = useState({})
  const [deleteId,        setDeleteId]        = useState(null)
  const [deleting,        setDeleting]        = useState(false)
  const debouncedSearch = useDebounce(search)

  const [formOpen,       setFormOpen]       = useState(false)
  const [formDefaults,   setFormDefaults]   = useState(null)
  const [formEditId,     setFormEditId]     = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching,   setFormFetching]   = useState(false)
  const [formDirty,      setFormDirty]      = useState(false)
  const [reservedId,     setReservedId]     = useState(null)  // RULE 10 — pre-reserved content ID

  // Read data from Zustand store
  const { items: data = [], totalPages = 1, loading = false, fetch } = store ? store() : {}

  const totalPageViews = data.reduce((s, i) => s + (i.pageViews || 0), 0)

  const extraFilterStr = JSON.stringify(extraFilterVals)

  // Fetch via store — store saves _params so SSE-triggered re-fetch uses same filters
   
  useEffect(() => {
    if (!fetch) return
    fetch({ page, limit: PAGE_SIZE, search: debouncedSearch, ...extraFilterVals })
  }, [page, debouncedSearch, extraFilterStr]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-open create form when navigated from Quick Actions
  useEffect(() => {
    if (location.state?.openCreate && FormComponent) {
      openCreate()
      window.history.replaceState({}, '')
    }
  }, [location.state]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(deleteId)
      toast.success('Moved to Recycle Bin')
      setDeleteId(null)
      if (fetch) fetch()
    } catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = async () => {
    if (!FormComponent) { navigate(createPath); return }
    setFormEditId(null); setFormDirty(false); setReservedId(null)
    setFormDefaults({}); setFormOpen(true)  // open immediately — don't wait for reserveId
    // RULE 10 — reserve a content ID concurrently so the upload filename matches before the doc is created
    if (idPrefix) {
      try {
        const r = await uploadApi.reserveId(idPrefix)
        setReservedId(r.data.data.id)
      } catch {
        toast.error('Failed to reserve ID — please try again')
        setFormOpen(false)
      }
    }
  }

  const openEdit = async (id) => {
    if (!FormComponent) { navigate(editPath(id)); return }
    setFormFetching(true); setFormOpen(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false)
    try { const r = await api.getById(id); setFormDefaults(r.data.data) }
    catch { toast.error('Failed to load item'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true)
    try {
      if (formEditId) {
        await api.update(formEditId, formData)
        toast.success('Updated!')
      } else {
        // RULE 10 — include pre-reserved ID so Firestore doc ID matches the uploaded filenames
        const payload = reservedId ? { ...formData, _reservedId: reservedId } : formData
        await api.create(payload)
        toast.success('Created!')
      }
      setFormOpen(false); setFormDirty(false); setReservedId(null)
      if (fetch) fetch()
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Save failed')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleCloseForm = () => {
    if (formDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to close?')) return
    }
    setFormOpen(false); setFormDirty(false); setReservedId(null)
  }

  const inp = 'px-3 py-2 text-sm rounded-lg focus:outline-none transition-all'
  const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }
  const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
  const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

  const columns = [
    {
      accessorKey: 'thumbnail',
      header: '',
      cell: ({ row }) => row.original.thumbnail
        ? <img src={row.original.thumbnail} alt={row.original.thumbnailAlt || ''} className="w-10 h-8 object-cover rounded-lg" />
        : <div className="w-10 h-8 rounded-lg bg-slate-100" />,
    },
    {
      accessorKey: titleKey,
      header: 'Title / Name',
      cell: ({ getValue }) => <span className="font-medium text-slate-800">{truncate(getValue() || '', 60)}</span>,
    },
    ...extraColumns,
    ...(!hideCardViews ? [{
      accessorKey: 'cardViews',
      header: 'Card Views',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-slate-400 text-xs">
          <Eye className="w-3 h-3" />
          {row.original.cardViews ?? 0}
        </span>
      ),
    }] : []),
    ...(showImpressions ? [{
      accessorKey: 'impressions',
      header: 'Impressions',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-slate-400 text-xs">
          <Eye className="w-3 h-3" />
          {row.original.impressions ?? 0}
        </span>
      ),
    }] : []),
    ...(showClicks ? [{
      accessorKey: 'clicks',
      header: 'Clicks',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-slate-400 text-xs">
          <MousePointerClick className="w-3 h-3" />
          {row.original.clicks ?? 0}
        </span>
      ),
    }] : []),
    ...(showTouches ? [{
      accessorKey: 'touches',
      header: 'Touches',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-slate-400 text-xs">
          <MousePointerClick className="w-3 h-3" />
          {row.original.touches ?? 0}
        </span>
      ),
    }] : []),
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="text-slate-500 text-xs">{formatDate(getValue())}</span>
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
        title={title}
        pageViews={totalPageViews}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {headerExtra}
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg,#8B5CF6,#6366F1)`, boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}
            >
              <Plus className="w-4 h-4" /> Add {title}
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="w-full sm:w-64">
          <label htmlFor={`search-${title.toLowerCase().replace(/\s+/g, '-')}`} className="sr-only">
            Search {title.toLowerCase()}
          </label>
          <input
            id={`search-${title.toLowerCase().replace(/\s+/g, '-')}`}
            name="search" autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder={`Search ${title.toLowerCase()}…`}
            className={`${inp} w-full`} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
          />
        </div>
        {extraFilters.map(({ key, label, options }) => {
          const filterId = `filter-${key}-${title.toLowerCase().replace(/\s+/g, '-')}`
          return (
            <div key={key} className="w-full sm:w-auto">
              <label htmlFor={filterId} className="sr-only">Filter by {label}</label>
              <select
                id={filterId}
                name={`filter-${key}`}
                value={extraFilterVals[key] || ''}
                onChange={(e) => { setExtraFilterVals((p) => ({ ...p, [key]: e.target.value })); setPage(1) }}
                className={`${inp} w-full sm:w-auto`} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
              >
                <option value="">All {label}s</option>
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400"><Info className="w-3 h-3" /><span>Row actions:</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Pencil className="w-3 h-3" style={{ color: P }} /><span>Edit</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Trash2 className="w-3 h-3 text-red-400" /><span>Delete (moves to Recycle Bin)</span></div>
        {!hideCardViews && <div className="flex items-center gap-1 text-xs text-slate-400"><Eye className="w-3 h-3 text-slate-400" /><span>Card views</span></div>}
        {showImpressions && <div className="flex items-center gap-1 text-xs text-slate-400"><Eye className="w-3 h-3 text-slate-400" /><span>Impressions</span></div>}
        {(showClicks || showTouches) && <div className="flex items-center gap-1 text-xs text-slate-400"><MousePointerClick className="w-3 h-3 text-slate-400" /><span>{showTouches ? 'Touches' : 'Clicks'}</span></div>}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title={`Delete ${toSingular(title)}`}
        message={`This will move this ${toSingular(title).toLowerCase()} to the Recycle Bin. You can restore it within 15 days.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      {FormComponent && (
        <FormModal isOpen={formOpen} onClose={handleCloseForm} title={formEditId ? `Edit ${formModalTitle || title}` : `Add ${formModalTitle || title}`}>
          {formFetching || formDefaults === null ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-7 h-7 rounded-full animate-spin" style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
            </div>
          ) : (
            <FormComponent
              defaultValues={formDefaults}
              onSubmit={handleFormSubmit}
              loading={formSubmitting}
              onDirtyChange={setFormDirty}
              contentId={formEditId || reservedId}
            />
          )}
        </FormModal>
      )}
    </div>
  )
}
