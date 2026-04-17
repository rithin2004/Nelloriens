import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, Home, Building, Settings2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { realEstateApi, uploadApi } from '../../services/api'
import useRealEstateStore from '../../store/realEstateStore'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormModal from '../../components/common/FormModal'
import RealEstateForm from '../../components/forms/RealEstateForm'
import { formatDate, truncate } from '../../utils/helpers'
import { useDebounce } from '../../hooks/useDebounce'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'
const PAGE_SIZE = 20

const inp      = 'px-3 py-2 text-sm rounded-lg focus:outline-none transition-all'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }
const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

const TABS = [
  { key: 'sale', label: 'Sale', icon: Home },
  { key: 'rent', label: 'Rent', icon: Building },
]

export default function RealEstateList() {
  const routerLocation = useLocation()
  const navigate = useNavigate()

  const [activeTab,    setActiveTab]   = useState('sale')
  const [page,         setPage]        = useState(1)
  const [search,       setSearch]      = useState('')
  const [filterType,   setFilterType]  = useState('')
  const [filterBhk,    setFilterBhk]   = useState('')
  const [locations,    setLocations]   = useState([])
  const [propertyTypes, setPropertyTypes] = useState([])
  const [filterLoc,    setFilterLoc]   = useState('')
  const [deleteId,     setDeleteId]    = useState(null)
  const [deleting,     setDeleting]    = useState(false)
  const debouncedSearch = useDebounce(search)

  const [formOpen,       setFormOpen]       = useState(false)
  const [formDefaults,   setFormDefaults]   = useState(null)
  const [formEditId,     setFormEditId]     = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching,   setFormFetching]   = useState(false)
  const [reservedId,     setReservedId]     = useState(null)
  const [formDirty,      setFormDirty]      = useState(false)

  const { items: data, totalPages, loading, fetch } = useRealEstateStore()

  useEffect(() => {
    realEstateApi.getLocations().then((r) => setLocations(r.data || [])).catch(() => {})
    realEstateApi.getTypes().then((r) => setPropertyTypes(r.data || [])).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch({
      page, limit: PAGE_SIZE, search: debouncedSearch,
      section:   activeTab,
      type:      filterType  || undefined,
      location:  filterLoc   || undefined,
      bhk:       filterBhk   || undefined,
    })
  }, [page, debouncedSearch, activeTab, filterType, filterLoc, filterBhk]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (routerLocation.state?.openCreate) { openCreate(); window.history.replaceState({}, '') }
  }, [routerLocation.state]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = (tab) => { setActiveTab(tab); setPage(1); setSearch(''); setFilterType(''); setFilterBhk(''); setFilterLoc('') }

  const handleDelete = async () => {
    setDeleting(true)
    try { await realEstateApi.delete(deleteId); toast.success('Moved to Recycle Bin'); setDeleteId(null) }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = async () => {
    setFormEditId(null); setFormDirty(false)
    try { const r = await uploadApi.reserveId('RES'); setReservedId(r.data.data.id) }
    catch { toast.error('Failed to reserve ID — please try again'); return }
    setFormDefaults({ section: activeTab }); setFormOpen(true)
  }

  const openEdit = async (id) => {
    setFormFetching(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false); setFormOpen(true)
    try { const r = await realEstateApi.getById(id); setFormDefaults(r.data) }
    catch { toast.error('Failed to load'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true)
    const payload = { ...formData, section: activeTab }
    try {
      if (formEditId) {
        await realEstateApi.update(formEditId, payload)
        toast.success('Updated!')
      } else {
        await realEstateApi.create(reservedId ? { ...payload, _reservedId: reservedId } : payload)
        toast.success('Created!')
      }
      setFormOpen(false); setFormDirty(false); setReservedId(null)
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setFormSubmitting(false) }
  }

  const handleCloseForm = () => {
    if (formDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return
    setFormOpen(false); setFormDirty(false); setReservedId(null)
  }

  const isSale = activeTab === 'sale'

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
      cell: ({ getValue }) => <span className="font-medium text-slate-800">{truncate(getValue() || '', 40)}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => <span className="text-slate-600 text-xs">{getValue() || '—'}</span>,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span>,
    },
    {
      accessorKey: 'sqft',
      header: 'sqft',
      cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() ? `${getValue()} sqft` : '—'}</span>,
    },
    {
      accessorKey: isSale ? 'price' : 'monthlyRent',
      header: isSale ? 'Price' : 'Rent/mo',
      cell: ({ getValue }) => <span className="text-slate-600 text-xs font-medium">{getValue() || '—'}</span>,
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
        title="Real Estate"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/realestate/property-types')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all"
              style={{ background: PB, color: P, border: `1px solid ${PL}` }}>
              <Settings2 className="w-4 h-4" /> Types
            </button>
            <button onClick={() => navigate('/realestate/locations')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all"
              style={{ background: PB, color: P, border: `1px solid ${PL}` }}>
              <Settings2 className="w-4 h-4" /> Locations
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}
            >
              <Plus className="w-4 h-4" /> Add {isSale ? 'Sale' : 'Rental'}
            </button>
          </div>
        }
      />

      {/* Tab switcher — Sale | Rent */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: '#F1F5F9' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={activeTab === key
              ? { background: '#FFFFFF', color: P, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { color: '#64748B' }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div>
          <label htmlFor="search-realestate" className="sr-only">Search {activeTab} listings</label>
          <input
            id="search-realestate" name="search" autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search listings…"
            className={`${inp} w-full sm:w-56`}
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          />
        </div>
        <div>
          <label htmlFor="filter-re-type" className="sr-only">Filter by type</label>
          <select
            id="filter-re-type" name="filterType"
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
            className={inp}
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          >
            <option value="">All Types</option>
            {propertyTypes.length > 0
              ? propertyTypes.map((t) => <option key={t._id} value={t.name}>{t.name}</option>)
              : ['Plot', 'Flat', 'House', 'Villa'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-re-loc" className="sr-only">Filter by location</label>
          <select
            id="filter-re-loc" name="filterLocation"
            value={filterLoc}
            onChange={(e) => { setFilterLoc(e.target.value); setPage(1) }}
            className={inp}
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          >
            <option value="">All Locations</option>
            {locations.map((l) => <option key={l._id} value={l.name}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-re-bhk" className="sr-only">Filter by BHK</label>
          <select
            id="filter-re-bhk" name="filterBhk"
            value={filterBhk}
            onChange={(e) => { setFilterBhk(e.target.value); setPage(1) }}
            className={inp}
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          >
            <option value="">Any BHK</option>
            {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} BHK</option>)}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Listing"
        message="This will move the listing to the Recycle Bin. You can restore it within 15 days."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      <FormModal isOpen={formOpen} onClose={handleCloseForm}
        title={formEditId ? `Edit ${isSale ? 'Sale' : 'Rental'} Listing` : `Add ${isSale ? 'Sale' : 'Rental'} Listing`}
        maxWidth="max-w-3xl">
        {(formFetching || formDefaults === null) ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
          </div>
        ) : (
          <RealEstateForm
            defaultValues={formDefaults}
            onSubmit={handleFormSubmit}
            loading={formSubmitting}
            contentId={formEditId || reservedId}
          />
        )}
      </FormModal>
    </div>
  )
}
