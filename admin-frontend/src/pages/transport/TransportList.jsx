import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Train, Bus, Plane, MapPin, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { transportApi, uploadApi } from '../../services/api'
import useTransportStore from '../../store/transportStore'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormModal from '../../components/common/FormModal'
import TransportForm from '../../components/forms/TransportForm'
import { formatDate, truncate } from '../../utils/helpers'
import { useDebounce } from '../../hooks/useDebounce'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'
const PAGE_SIZE = 20

// RULE 31 — Fixed categories, no management page
const TABS = [
  { key: 'train',   label: 'Train',          icon: Train  },
  { key: 'bus',     label: 'Bus',            icon: Bus    },
  { key: 'airport', label: 'Airport',        icon: Plane  },
  { key: 'local',   label: 'Local Transport',icon: MapPin },
]

const TAB_ADD_LABELS = {
  train:   'Add Train',
  bus:     'Add Bus',
  airport: 'Add Airport',
  local:   'Add Local Transport',
}

const inp = 'px-3 py-2 text-sm rounded-lg focus:outline-none transition-all'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }
const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

export default function TransportList() {
  const [tab,    setTab]    = useState('train')
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)
  const debouncedSearch = useDebounce(search)

  const { items: data, totalPages, loading, fetch } = useTransportStore()

  const [deleteId,       setDeleteId]       = useState(null)
  const [deleting,       setDeleting]       = useState(false)
  const [formOpen,       setFormOpen]       = useState(false)
  const [formDefaults,   setFormDefaults]   = useState(null)
  const [formEditId,     setFormEditId]     = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching,   setFormFetching]   = useState(false)
  const [formDirty,      setFormDirty]      = useState(false)
  const [reservedId,     setReservedId]     = useState(null)

  useEffect(() => {
    fetch({ page, limit: PAGE_SIZE, search: debouncedSearch, type: tab })
  }, [tab, page, debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = (t) => { setTab(t); setPage(1); setSearch('') }

  const handleDelete = async () => {
    setDeleting(true)
    try { await transportApi.delete(deleteId); toast.success('Moved to Recycle Bin'); setDeleteId(null); fetch() }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = async () => {
    setFormEditId(null); setFormDirty(false); setReservedId(null)
    setFormDefaults({ type: tab }); setFormOpen(true)
    try { const r = await uploadApi.reserveId('TRN'); setReservedId(r.data.data.id) }
    catch { toast.error('Failed to reserve ID — please try again'); setFormOpen(false) }
  }

  const openEdit = async (id) => {
    setFormFetching(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false); setFormOpen(true)
    try { const r = await transportApi.getById(id); setFormDefaults(r.data.data) }
    catch { toast.error('Failed to load'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true)
    try {
      if (formEditId) { await transportApi.update(formEditId, formData); toast.success('Updated!') }
      else            { await transportApi.create(reservedId ? { ...formData, _reservedId: reservedId } : formData); toast.success('Created!') }
      setFormOpen(false); setFormDirty(false); setReservedId(null)
      fetch()
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

  // Train columns
  const trainColumns = [
    { accessorKey: 'trainNumber', header: 'Number', cell: ({ getValue }) => <span className="text-slate-500 text-xs font-mono">{getValue() || '—'}</span> },
    { accessorKey: 'name', header: 'Name', cell: ({ getValue }) => <span className="font-medium text-slate-800">{truncate(getValue() || '', 40)}</span> },
    { accessorKey: 'departureStation', header: 'From', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    { accessorKey: 'arrivalStation',   header: 'To',   cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    { accessorKey: 'departureTime',    header: 'Dep.',  cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    { accessorKey: 'createdAt', header: 'Added', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{formatDate(getValue())}</span> },
    { id: 'actions', header: '', cell: ({ row }) => actionButtons(row) },
  ]

  // Bus columns
  const busColumns = [
    { accessorKey: 'routeNumber', header: 'Route', cell: ({ getValue }) => <span className="text-slate-500 text-xs font-mono">{getValue() || '—'}</span> },
    { accessorKey: 'name', header: 'Name', cell: ({ getValue }) => <span className="font-medium text-slate-800">{truncate(getValue() || '', 40)}</span> },
    { accessorKey: 'fromLocation', header: 'From', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    { accessorKey: 'toLocation',   header: 'To',   cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    { accessorKey: 'operator',     header: 'Operator', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    { accessorKey: 'createdAt', header: 'Added', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{formatDate(getValue())}</span> },
    { id: 'actions', header: '', cell: ({ row }) => actionButtons(row) },
  ]

  // Airport columns
  const airportColumns = [
    { accessorKey: 'iataCode', header: 'IATA', cell: ({ getValue }) => <span className="text-slate-500 text-xs font-mono font-bold">{getValue() || '—'}</span> },
    { accessorKey: 'name', header: 'Airport', cell: ({ getValue }) => <span className="font-medium text-slate-800">{truncate(getValue() || '', 40)}</span> },
    { accessorKey: 'terminals', header: 'Terminals', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    { accessorKey: 'createdAt', header: 'Added', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{formatDate(getValue())}</span> },
    { id: 'actions', header: '', cell: ({ row }) => actionButtons(row) },
  ]

  // Local transport columns
  const localColumns = [
    { accessorKey: 'name', header: 'Service Name', cell: ({ getValue }) => <span className="font-medium text-slate-800">{truncate(getValue() || '', 40)}</span> },
    { accessorKey: 'serviceType', header: 'Type', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    { accessorKey: 'coverageArea', header: 'Coverage', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{truncate(getValue() || '—', 30)}</span> },
    { accessorKey: 'baseFare', header: 'Base Fare', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    { accessorKey: 'createdAt', header: 'Added', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{formatDate(getValue())}</span> },
    { id: 'actions', header: '', cell: ({ row }) => actionButtons(row) },
  ]

  const tabColumns = { train: trainColumns, bus: busColumns, airport: airportColumns, local: localColumns }

  const formTitle = formEditId
    ? `Edit ${TABS.find(t => t.key === (formDefaults?.type || tab))?.label || 'Transport'}`
    : TAB_ADD_LABELS[tab]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Transport"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}
          >
            <Plus className="w-4 h-4" /> {TAB_ADD_LABELS[tab]}
          </button>
        }
      />

      {/* Fixed category tabs — RULE 31: no category management page */}
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

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <div>
          <label htmlFor="search-transport" className="sr-only">Search transport</label>
          <input
            id="search-transport" name="search" autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search…"
            className={`${inp} w-56`}
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          />
        </div>
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
        title="Delete Transport"
        message="This will move the item to the Recycle Bin. You can restore it within 15 days."
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
          <TransportForm
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
