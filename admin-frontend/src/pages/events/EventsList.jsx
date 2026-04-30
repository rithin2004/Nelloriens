import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Pencil, Trash2, Tag, Star, Users, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { eventsApi, uploadApi } from '../../services/api'
import useEventsStore from '../../store/eventsStore'
import useAnalyticsStore from '../../store/analyticsStore'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormModal from '../../components/common/FormModal'
import EventForm from '../../components/forms/EventForm'
import { formatDate, truncate } from '../../utils/helpers'
import { useDebounce } from '../../hooks/useDebounce'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'
const PAGE_SIZE = 20

const TABS = [
  { key: 'events',     label: 'Events',            icon: Tag   },
  { key: 'influencer', label: 'Influencer Events',  icon: Users },
]

function ToggleSwitch({ checked, onChange, loading }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={loading}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40"
      style={{ background: checked ? '#F59E0B' : '#CBD5E1' }}
      title={checked ? 'Remove from Popular' : 'Mark as Popular'}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5"
        style={{ marginLeft: checked ? '18px' : '2px' }}
      />
    </button>
  )
}

const inp = 'px-3 py-2 text-sm rounded-lg focus:outline-none transition-all'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }
const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

export default function EventsList() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const [tab,        setTab]        = useState('events')
  const [page,       setPage]       = useState(1)
  const [search,     setSearch]     = useState('')
  const [categories, setCategories] = useState([])
  const [catFilter,  setCatFilter]  = useState('')
  const [deleteId,   setDeleteId]   = useState(null)
  const [deleting,   setDeleting]   = useState(false)
  const [togglingId,         setTogglingId]         = useState(null)
  const [togglingVerifiedId, setTogglingVerifiedId] = useState(null)
  const debouncedSearch = useDebounce(search)

  // Replace prompt state (RULE 13 — popular max 3 per category)
  const [replaceOpen,        setReplaceOpen]        = useState(false)
  const [replaceCandidates,  setReplaceCandidates]  = useState([])
  const [replacePendingItem, setReplacePendingItem] = useState(null)
  const [replacingId,        setReplacingId]        = useState(null)

  // Influencer events state
  const [infItems,     setInfItems]     = useState([])
  const [infTotal,     setInfTotal]     = useState(0)
  const [infPage,      setInfPage]      = useState(1)
  const [infTotalPages,setInfTotalPages]= useState(1)
  const [infLoading,   setInfLoading]   = useState(false)

  // Form state
  const [formOpen,       setFormOpen]       = useState(false)
  const [formDefaults,   setFormDefaults]   = useState(null)
  const [formEditId,     setFormEditId]     = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching,   setFormFetching]   = useState(false)
  const [formDirty,      setFormDirty]      = useState(false)
  const [reservedId,     setReservedId]     = useState(null)

  const { items: data, totalPages, loading, fetch } = useEventsStore()

  const { pageViews: analyticsPageViews, loaded: analyticsLoaded, fetch: fetchAnalytics } = useAnalyticsStore()
  useEffect(() => { if (!analyticsLoaded) fetchAnalytics() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const totalPageViews = analyticsPageViews['events'] || 0

  // Fetch regular events
  useEffect(() => {
    if (tab !== 'events') return
    fetch({ page, limit: PAGE_SIZE, search: debouncedSearch, category: catFilter })
  }, [tab, page, debouncedSearch, catFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch influencer events
  useEffect(() => {
    if (tab !== 'influencer') return
    setInfLoading(true)
    eventsApi.getInfluencerEvents({ page: infPage, limit: PAGE_SIZE, search: debouncedSearch })
      .then(r => {
        setInfItems(r.data.data || [])
        setInfTotal(r.data.pagination?.total || 0)
        setInfTotalPages(r.data.pagination?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load influencer events'))
      .finally(() => setInfLoading(false))
  }, [tab, infPage, debouncedSearch])  

  useEffect(() => {
    eventsApi.getCategories().then(r => setCategories(r.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (location.state?.openCreate) { openCreate(); window.history.replaceState({}, '') }
  }, [location.state])  

  const switchTab = (t) => { setTab(t); setPage(1); setInfPage(1) }

  const handleTogglePopular = async (item) => {
    setTogglingId(item._id)
    try {
      await eventsApi.update(item._id, { isPopular: !item.isPopular })
      toast.success(item.isPopular ? 'Removed from Popular' : 'Marked as Popular')
      fetch()
    } catch (e) {
      if (e?.response?.data?.code === 'MAX_LIMIT_REACHED') {
        setReplaceCandidates(e.response.data.currentItems || [])
        setReplacePendingItem(item)
        setReplaceOpen(true)
      } else {
        toast.error(e?.response?.data?.message || 'Failed to update')
      }
    } finally { setTogglingId(null) }
  }

  const handleToggleVerified = async (item) => {
    setTogglingVerifiedId(item._id)
    try {
      await eventsApi.update(item._id, { isVerified: !item.isVerified })
      toast.success(item.isVerified ? 'Verification removed' : 'Marked as Verified')
      fetch()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update')
    } finally { setTogglingVerifiedId(null) }
  }

  const handleReplaceConfirm = async (replaceId) => {
    if (!replacePendingItem) return
    setReplacingId(replaceId)
    try {
      await eventsApi.update(replacePendingItem._id, { isPopular: true, replaceId })
      toast.success('Marked as Popular — replaced previous item')
      setReplaceOpen(false); setReplaceCandidates([]); setReplacePendingItem(null)
      fetch()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update')
    } finally { setReplacingId(null) }
  }

  const fetchInfluencerEvents = () => {
    setInfLoading(true)
    eventsApi.getInfluencerEvents({ page: infPage, limit: PAGE_SIZE, search: debouncedSearch })
      .then(r => { setInfItems(r.data.data || []); setInfTotal(r.data.pagination?.total || 0); setInfTotalPages(r.data.pagination?.totalPages || 1) })
      .catch(() => {})
      .finally(() => setInfLoading(false))
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      if (tab === 'influencer') { await eventsApi.deleteInfluencerEvent(deleteId) }
      else                      { await eventsApi.delete(deleteId) }
      toast.success('Moved to Recycle Bin')
      setDeleteId(null)
      if (tab === 'influencer') fetchInfluencerEvents()
      else fetch()
    } catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = async () => {
    setFormEditId(null); setFormDirty(false); setReservedId(null)
    setFormDefaults({}); setFormOpen(true)  // open immediately
    try { const r = await uploadApi.reserveId('EVT'); setReservedId(r.data.data.id) }
    catch { toast.error('Failed to reserve ID — please try again'); setFormOpen(false) }
  }

  const openEdit = async (id) => {
    setFormFetching(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false); setFormOpen(true)
    try {
      const r = tab === 'influencer'
        ? await eventsApi.getInfluencerEventById(id)
        : await eventsApi.getById(id)
      setFormDefaults(r.data.data)
    } catch { toast.error('Failed to load'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true)
    try {
      if (formEditId) {
        if (tab === 'influencer') await eventsApi.updateInfluencerEvent(formEditId, formData)
        else                      await eventsApi.update(formEditId, formData)
        toast.success('Updated!')
      } else {
        const payload = reservedId ? { ...formData, _reservedId: reservedId } : formData
        if (tab === 'influencer') await eventsApi.createInfluencerEvent(payload)
        else                      await eventsApi.create(payload)
        toast.success('Created!')
      }
      setFormOpen(false); setFormDirty(false); setReservedId(null)
      if (tab === 'influencer') {
        eventsApi.getInfluencerEvents({ page: infPage, limit: PAGE_SIZE })
          .then(r => { setInfItems(r.data.data || []); setInfTotal(r.data.pagination?.total || 0); setInfTotalPages(r.data.pagination?.totalPages || 1) })
          .catch(() => {})
      } else {
        fetch()
      }
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setFormSubmitting(false) }
  }

  const handleCloseForm = () => {
    if (formDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return
    setFormOpen(false); setFormDirty(false); setReservedId(null)
  }

  // ── Columns ────────────────────────────────────────────────────────────────

  const actionBtns = (id) => (
    <div className="flex gap-1">
      <button onClick={() => openEdit(id)}
        className="p-1.5 rounded-lg text-slate-400 transition-colors"
        onMouseEnter={(e) => { e.currentTarget.style.color = P; e.currentTarget.style.background = PB }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
        <Pencil className="w-4 h-4" />
      </button>
      <button onClick={() => setDeleteId(id)}
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
      header: 'Title',
      cell: ({ getValue }) => <span className="font-medium text-slate-800">{truncate(getValue() || '', 50)}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <span className="text-slate-500 text-xs">{row.original.category?.name || row.original.category || '—'}</span>,
    },
    {
      accessorKey: 'startDate',
      header: 'Date',
      cell: ({ getValue }) => <span className="text-slate-500 text-xs">{formatDate(getValue())}</span>,
    },
    {
      accessorKey: 'cardViews',
      header: 'Card Views',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-slate-400 text-xs">
          <Eye className="w-3 h-3" /> {row.original.cardViews ?? 0}
        </span>
      ),
    },
    {
      id: 'popular',
      header: 'Popular',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ToggleSwitch
            checked={!!row.original.isPopular}
            onChange={() => handleTogglePopular(row.original)}
            loading={togglingId === row.original._id}
          />
          {row.original.isPopular && <Star className="w-3.5 h-3.5 text-amber-400" />}
        </div>
      ),
    },
    {
      id: 'isVerified',
      header: 'Verified',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => handleToggleVerified(row.original)}
          disabled={togglingVerifiedId === row.original._id}
          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40"
          style={{ background: row.original.isVerified ? '#10B981' : '#CBD5E1' }}
          title={row.original.isVerified ? 'Remove Verification' : 'Mark as Verified'}
        >
          <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5"
            style={{ marginLeft: row.original.isVerified ? '18px' : '2px' }} />
        </button>
      ),
    },
    { id: 'actions', header: '', cell: ({ row }) => actionBtns(row.original._id) },
  ]

  const influencerColumns = [
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
      cell: ({ getValue }) => <span className="font-medium text-slate-800">{truncate(getValue() || '', 55)}</span>,
    },
    {
      accessorKey: 'influencerName',
      header: 'Influencer',
      cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span>,
    },
    {
      accessorKey: 'eventDate',
      header: 'Date',
      cell: ({ getValue }) => <span className="text-slate-500 text-xs">{formatDate(getValue())}</span>,
    },
    {
      accessorKey: 'cardViews',
      header: 'Card Views',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-slate-400 text-xs">
          <Eye className="w-3 h-3" /> {row.original.cardViews ?? 0}
        </span>
      ),
    },
    { id: 'actions', header: '', cell: ({ row }) => actionBtns(row.original._id) },
  ]

  const isInfluencer = tab === 'influencer'

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Events"
        pageViews={totalPageViews}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/events/manage')}
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
              <Plus className="w-4 h-4" /> {isInfluencer ? 'Add Influencer Event' : 'Add Event'}
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
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div>
          <label htmlFor="search-events" className="sr-only">Search events</label>
          <input
            id="search-events" name="search" autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); setInfPage(1) }}
            placeholder="Search by title…"
            className={`${inp} w-full sm:w-64`}
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          />
        </div>
        {tab === 'events' && categories.length > 0 && (
          <div>
            <label htmlFor="filter-category-events" className="sr-only">Filter by category</label>
            <select id="filter-category-events" name="filter-category"
              value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1) }}
              className={inp} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        )}
        {tab === 'influencer' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-purple-700"
            style={{ background: '#EDE9FE', border: '1px solid #DDD6FE' }}>
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Max 5 Influencer Events globally.</span>
            <span className="font-semibold">{infTotal}/5</span>
          </div>
        )}
        {tab === 'events' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-amber-700"
            style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <Star className="w-3.5 h-3.5 shrink-0" />
            <span>Max 3 Popular events per category.</span>
          </div>
        )}
      </div>

      <DataTable
        columns={isInfluencer ? influencerColumns : eventsColumns}
        data={isInfluencer ? infItems : data}
        isLoading={isInfluencer ? infLoading : loading}
        page={isInfluencer ? infPage : page}
        totalPages={isInfluencer ? infTotalPages : totalPages}
        onPageChange={isInfluencer ? setInfPage : setPage}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        title={`Delete ${isInfluencer ? 'Influencer Event' : 'Event'}`}
        message="This will move the event to the Recycle Bin. You can restore it within 15 days."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      <FormModal isOpen={formOpen} onClose={handleCloseForm}
        title={formEditId ? `Edit ${isInfluencer ? 'Influencer Event' : 'Event'}` : `Add ${isInfluencer ? 'Influencer Event' : 'Event'}`}
        maxWidth="max-w-3xl">
        {(formFetching || formDefaults === null) ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
          </div>
        ) : (
          <EventForm
            defaultValues={formDefaults}
            onSubmit={handleFormSubmit}
            loading={formSubmitting}
            onDirtyChange={setFormDirty}
            contentId={formEditId || reservedId}
            isInfluencer={isInfluencer}
          />
        )}
      </FormModal>

      {/* RULE 13 — Replace prompt for isPopular toggle max 3/category */}
      {replaceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Max Popular Reached</h3>
            <p className="text-sm text-slate-500 mb-4">
              This category already has 3 Popular events. Choose one to replace:
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
