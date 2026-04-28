import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Pencil, Trash2, Star, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { staysApi, uploadApi } from '../../services/api'
import useStaysStore from '../../store/staysStore'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormModal from '../../components/common/FormModal'
import StayForm from '../../components/forms/StayForm'
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
      title={checked ? 'Remove from Top' : 'Mark as Top Stay'}
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

export default function StaysList() {
  const location = useLocation()

  const [page,       setPage]       = useState(1)
  const [search,     setSearch]     = useState('')
  const [deleteId,   setDeleteId]   = useState(null)
  const [deleting,   setDeleting]   = useState(false)
  const [togglingId,         setTogglingId]         = useState(null)
  const [togglingVerifiedId, setTogglingVerifiedId] = useState(null)
  const debouncedSearch = useDebounce(search)

  // Replace prompt (RULE 13 — isTop max 3 per category)
  const [replaceOpen,        setReplaceOpen]        = useState(false)
  const [replaceCandidates,  setReplaceCandidates]  = useState([])
  const [replacePendingItem, setReplacePendingItem] = useState(null)
  const [replacingId,        setReplacingId]        = useState(null)

  // Form state
  const [formOpen,       setFormOpen]       = useState(false)
  const [formDefaults,   setFormDefaults]   = useState(null)
  const [formEditId,     setFormEditId]     = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching,   setFormFetching]   = useState(false)
  const [formDirty,      setFormDirty]      = useState(false)
  const [reservedId,     setReservedId]     = useState(null)

  // Top Stays dedicated section
  const [topStays,        setTopStays]        = useState([])
  const [topStaysLoading, setTopStaysLoading] = useState(false)

  const { items: data, totalPages, loading, fetch } = useStaysStore()

  const loadTopStays = async () => {
    setTopStaysLoading(true)
    try {
      const r = await staysApi.getAll({ isTop: true, page: 1, limit: 50 })
      setTopStays((r.data.data || []).filter(s => s.isTop))
    } catch { /* supplementary section — silent failure */ }
    finally { setTopStaysLoading(false) }
  }

  useEffect(() => { loadTopStays() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch({ page, limit: PAGE_SIZE, search: debouncedSearch })
  }, [page, debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (location.state?.openCreate) { openCreate(); window.history.replaceState({}, '') }
  }, [location.state])

  const handleToggleTop = async (item) => {
    setTogglingId(item._id)
    try {
      await staysApi.update(item._id, { isTop: !item.isTop })
      toast.success(item.isTop ? 'Removed from Top' : 'Marked as Top Stay')
      loadTopStays(); fetch()
    } catch (e) {
      // RULE 13 — max 3 top per category: show replace prompt
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
      await staysApi.update(item._id, { isVerified: !item.isVerified })
      toast.success(item.isVerified ? 'Verification removed' : 'Marked as Verified')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update')
    } finally { setTogglingVerifiedId(null) }
  }

  const handleReplaceConfirm = async (replaceId) => {
    if (!replacePendingItem) return
    setReplacingId(replaceId)
    try {
      await staysApi.update(replacePendingItem._id, { isTop: true, replaceId })
      toast.success('Marked as Top Stay — replaced previous item')
      setReplaceOpen(false); setReplaceCandidates([]); setReplacePendingItem(null)
      loadTopStays()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update')
    } finally { setReplacingId(null) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await staysApi.delete(deleteId)
      toast.success('Moved to Recycle Bin')
      setDeleteId(null)
      loadTopStays()
      fetch()
    }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = async () => {
    setFormEditId(null); setFormDirty(false)
    try { const r = await uploadApi.reserveId('STY'); setReservedId(r.data.data.id) }
    catch { toast.error('Failed to reserve ID — please try again'); return }
    setFormDefaults({}); setFormOpen(true)
  }

  const openEdit = async (id) => {
    setFormFetching(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false); setFormOpen(true)
    try { const r = await staysApi.getById(id); setFormDefaults(r.data.data) }
    catch { toast.error('Failed to load'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true)
    try {
      if (formEditId) { await staysApi.update(formEditId, formData); toast.success('Updated!') }
      else            { await staysApi.create(reservedId ? { ...formData, _reservedId: reservedId } : formData); toast.success('Created!') }
      setFormOpen(false); setFormDirty(false); setReservedId(null)
      loadTopStays()
      fetch()
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setFormSubmitting(false) }
  }

  const handleCloseForm = () => {
    if (formDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return
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
      header: 'Hotel',
      cell: ({ getValue }) => <span className="font-medium text-slate-800">{truncate(getValue() || '', 45)}</span>,
    },
    {
      accessorKey: 'starRating',
      header: 'Stars',
      cell: ({ getValue }) => getValue()
        ? <span className="text-amber-400 text-sm">{'★'.repeat(parseInt(getValue()))}</span>
        : <span className="text-slate-300 text-xs">—</span>,
    },
    {
      accessorKey: 'pricePerNight',
      header: 'Price',
      cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span>,
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
      id: 'isTop',
      header: 'Top Stay',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ToggleSwitch
            checked={!!row.original.isTop}
            onChange={() => handleToggleTop(row.original)}
            loading={togglingId === row.original._id}
          />
          {row.original.isTop && <Star className="w-3.5 h-3.5 text-amber-400" />}
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
        title="Stays"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}
          >
            <Plus className="w-4 h-4" /> Add Stay
          </button>
        }
      />

      {/* Top Stays pinned section */}
      <div className="rounded-xl p-4 mb-5" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-amber-500 shrink-0" />
          <h3 className="font-semibold text-amber-800 text-sm">Top Stays</h3>
          <span className="text-xs text-amber-600 ml-1">
            {topStaysLoading ? '…' : `${topStays.length} pinned`} · max 3 per category shown on user side
          </span>
        </div>
        {topStaysLoading ? (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-36 h-14 rounded-lg animate-pulse" style={{ background: '#FEF3C7' }} />
            ))}
          </div>
        ) : topStays.length === 0 ? (
          <p className="text-xs text-amber-500 italic">No Top Stays yet — toggle the switch on any stay to pin it here.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topStays.map((s) => (
              <div
                key={s._id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}
              >
                {s.thumbnail && (
                  <img src={s.thumbnail} className="w-10 h-8 object-cover rounded shrink-0" alt="" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-amber-900 truncate max-w-30">{s.title}</p>
                  {s.starRating && (
                    <p className="text-amber-400 text-xs leading-none">{'★'.repeat(parseInt(s.starRating))}</p>
                  )}
                </div>
                <button
                  onClick={() => openEdit(s._id)}
                  title="Edit"
                  className="p-1 rounded text-amber-600 transition-colors shrink-0"
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FDE68A'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div>
          <label htmlFor="search-stays" className="sr-only">Search stays</label>
          <input
            id="search-stays" name="search" autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name…"
            className={`${inp} w-full sm:w-64`}
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          />
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
        title="Delete Stay"
        message="This will move the stay to the Recycle Bin. You can restore it within 15 days."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      <FormModal isOpen={formOpen} onClose={handleCloseForm}
        title={formEditId ? 'Edit Stay' : 'Add Stay'}
        maxWidth="max-w-3xl">
        {(formFetching || formDefaults === null) ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
          </div>
        ) : (
          <StayForm
            defaultValues={formDefaults}
            onSubmit={handleFormSubmit}
            loading={formSubmitting}
            onDirtyChange={setFormDirty}
            contentId={formEditId || reservedId}
          />
        )}
      </FormModal>

      {/* RULE 13 — Replace prompt for isTop max 3/category */}
      {replaceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Max Top Stays Reached</h3>
            <p className="text-sm text-slate-500 mb-4">
              This category already has 3 Top stays. Choose one to replace:
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
                  <span className="text-sm font-medium text-slate-700 line-clamp-2">{c.title || c.hotelName}</span>
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
