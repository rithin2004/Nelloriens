import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Pencil, Trash2, Info, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from './PageHeader'
import DataTable from './DataTable'
import ConfirmModal from './ConfirmModal'
import FormModal from './FormModal'
import { formatDate, truncate } from '../../utils/helpers'
import { useDebounce } from '../../hooks/useDebounce'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

export default function ModuleList({
  title,
  createPath,
  editPath,
  api,
  extraColumns = [],
  titleKey = 'title',
  FormComponent,
  formModalTitle,
  extraFilters = [],
  headerExtra,
}) {
  const navigate  = useNavigate()
  const location  = useLocation()

  const [data,            setData]            = useState([])
  const [loading,         setLoading]         = useState(true)
  const [page,            setPage]            = useState(1)
  const [totalPages,      setTotalPages]      = useState(1)
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

  const fetchData = () => {
    setLoading(true)
    api.getAll({ page, limit: 20, search: debouncedSearch, ...extraFilterVals })
      .then((r) => { setData(r.data.items || []); setTotalPages(r.data.totalPages || 1) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [page, debouncedSearch, JSON.stringify(extraFilterVals)])

  useEffect(() => {
    if (location.state?.openCreate && FormComponent) {
      openCreate()
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const handleDelete = async () => {
    setDeleting(true)
    try { await api.delete(deleteId); toast.success('Deleted'); setDeleteId(null); fetchData() }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = () => {
    if (!FormComponent) { navigate(createPath); return }
    setFormDefaults({}); setFormEditId(null); setFormDirty(false); setFormOpen(true)
  }

  const openEdit = async (id) => {
    if (!FormComponent) { navigate(editPath(id)); return }
    setFormFetching(true); setFormOpen(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false)
    try { const r = await api.getById(id); setFormDefaults(r.data) }
    catch { toast.error('Failed to load item'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true)
    try {
      if (formEditId) { await api.update(formEditId, formData); toast.success('Updated!') }
      else            { await api.create(formData);             toast.success('Created!') }
      setFormOpen(false); setFormDirty(false); fetchData()
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
    setFormOpen(false); setFormDirty(false)
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
      header: 'Date',
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
        <input
          id={`search-${title.toLowerCase().replace(/\s+/g, '-')}`}
          name="search" autoComplete="off"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder={`Search ${title.toLowerCase()}…`}
          className={`${inp} w-full sm:w-64`} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
        />
        {extraFilters.map(({ key, label, options }) => (
          <select key={key} value={extraFilterVals[key] || ''}
            onChange={(e) => { setExtraFilterVals((p) => ({ ...p, [key]: e.target.value })); setPage(1) }}
            className={inp} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}>
            <option value="">All {label}s</option>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400"><Info className="w-3 h-3" /><span>Row actions:</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Pencil className="w-3 h-3" style={{ color: P }} /><span>Edit</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Trash2 className="w-3 h-3 text-red-400" /><span>Delete</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Eye className="w-3 h-3 text-slate-400" /><span>View count</span></div>
      </div>

      <ConfirmModal isOpen={!!deleteId} title={`Delete ${title}`} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />

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
            />
          )}
        </FormModal>
      )}
    </div>
  )
}
