import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, horizontalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Pencil, Trash2, Eye, Star, GripVertical, Upload, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { tourismApi, uploadApi } from '../../services/api'
import useTourismStore from '../../store/tourismStore'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormModal from '../../components/common/FormModal'
import TourismForm from '../../components/forms/TourismForm'
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

function ToggleSwitch({ checked, onChange, loading }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={loading}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40"
      style={{ background: checked ? '#8B5CF6' : '#CBD5E1' }}
      title={checked ? 'Remove from Popular' : 'Mark as Popular'}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5"
        style={{ marginLeft: checked ? '18px' : '2px' }}
      />
    </button>
  )
}

// ── Display Photo Slot — sortable ─────────────────────────────────────────────

function SortablePhotoSlot({ photo, index, onReplace, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: photo._id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderColor: PL }}
      className="relative w-40 h-28 rounded-xl overflow-hidden group border-2"
    >
      <img src={photo.url} alt={`Display photo ${index + 1}`} className="w-full h-full object-cover" />
      {/* Drag handle */}
      <button
        {...attributes} {...listeners}
        className="absolute top-1 left-1 p-1 rounded-lg bg-black/40 text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        title="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      {/* Replace & Delete */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onReplace(photo)}
          className="p-1 rounded-lg bg-blue-500 text-white" title="Replace photo">
          <Upload className="w-3 h-3" />
        </button>
        <button onClick={() => onDelete(photo._id)}
          className="p-1 rounded-lg bg-red-500 text-white" title="Delete photo">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
        style={{ background: 'rgba(0,0,0,0.5)' }}>
        {index + 1}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function TourismList() {
  const routerLocation = useLocation()

  // Display photos state
  const [displayPhotos,    setDisplayPhotos]    = useState([])
  const [photosLoading,    setPhotosLoading]    = useState(false)
  const [photoUploading,   setPhotoUploading]   = useState(false)
  const [replacingPhoto,   setReplacingPhoto]   = useState(null) // photo being replaced
  const [deletePhotoId,    setDeletePhotoId]    = useState(null)
  const [deletingPhoto,    setDeletingPhoto]    = useState(false)
  const photoUploadRef = useRef(null)
  const photoReplaceRef = useRef(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // Popular Destinations section
  const [popularPlaces,  setPopularPlaces]  = useState([])
  const [popularLoading, setPopularLoading] = useState(false)

  // List state
  const [page,        setPage]        = useState(1)
  const [search,      setSearch]      = useState('')
  const [filterCat,   setFilterCat]   = useState('')
  const [categories,  setCategories]  = useState([])
  const [deleteId,    setDeleteId]    = useState(null)
  const [deleting,    setDeleting]    = useState(false)
  const [togglingId,         setTogglingId]         = useState(null)
  const [togglingVerifiedId, setTogglingVerifiedId] = useState(null)
  const debouncedSearch = useDebounce(search)

  // Replace prompt (RULE 13 — isPopular max 10 globally)
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
  const [reservedId,     setReservedId]     = useState(null)

  const { items: data, totalPages, loading, fetch } = useTourismStore()

  const loadPopularPlaces = async () => {
    setPopularLoading(true)
    try {
      const r = await tourismApi.getAll({ isPopular: true, page: 1, limit: 50 })
      setPopularPlaces((r.data.data || []).filter(p => p.isPopular))
    } catch { /* supplementary section — silent failure */ }
    finally { setPopularLoading(false) }
  }

  // Load display photos
  useEffect(() => {
    loadDisplayPhotos()
    loadPopularPlaces()
    tourismApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
  }, [])  

  const loadDisplayPhotos = async () => {
    setPhotosLoading(true)
    try { const r = await tourismApi.getDisplayPhotos(); setDisplayPhotos(r.data.data || []) }
    catch { toast.error('Failed to load display photos') }
    finally { setPhotosLoading(false) }
  }

  useEffect(() => {
    fetch({ page, limit: PAGE_SIZE, search: debouncedSearch, category: filterCat || undefined })
  }, [page, debouncedSearch, filterCat]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (routerLocation.state?.openCreate) { openCreate(); window.history.replaceState({}, '') }
  }, [routerLocation.state])  

  // ── Display Photos handlers ──────────────────────────────────────────────

  const handleAddPhoto = () => {
    if (displayPhotos.length >= 3) { toast.error('Maximum 3 display photos allowed'); return }
    photoUploadRef.current?.click()
  }

  const handlePhotoUpload = async (e, existingPhoto = null) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5 MB'); return }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('contentId', 'display')
    fd.append('section', 'display')
    if (existingPhoto) fd.append('index', String(existingPhoto.order))
    setPhotoUploading(true)
    try {
      const r = await uploadApi.upload('tourism', fd)
      const url = r.data.data.url
      if (existingPhoto) {
        // Replace — delete old file, update doc
        if (existingPhoto.url) { try { await uploadApi.delete(existingPhoto.url) } catch { /* ignore */ } }
        await tourismApi.updateDisplayPhoto(existingPhoto._id, { url })
      } else {
        await tourismApi.createDisplayPhoto({ url })
      }
      await loadDisplayPhotos()
      toast.success(existingPhoto ? 'Photo replaced' : 'Photo added')
    } catch (e) { toast.error(e?.response?.data?.message || 'Upload failed') }
    finally { setPhotoUploading(false); e.target.value = '' }
  }

  const handleReplacePhoto = (photo) => {
    setReplacingPhoto(photo)
    photoReplaceRef.current?.click()
  }

  const handleDeletePhoto = async () => {
    setDeletingPhoto(true)
    try {
      const photo = displayPhotos.find(p => p._id === deletePhotoId)
      if (photo?.url) { try { await uploadApi.delete(photo.url) } catch { /* ignore */ } }
      await tourismApi.deleteDisplayPhoto(deletePhotoId)
      setDeletePhotoId(null)
      await loadDisplayPhotos()
      toast.success('Photo deleted')
    } catch { toast.error('Delete failed') }
    finally { setDeletingPhoto(false) }
  }

  const handlePhotoDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = displayPhotos.findIndex(p => p._id === active.id)
    const newIdx = displayPhotos.findIndex(p => p._id === over.id)
    const reordered = arrayMove(displayPhotos, oldIdx, newIdx)
    setDisplayPhotos(reordered)
    try {
      await tourismApi.reorderDisplayPhotos(reordered.map(p => p._id))
    } catch { toast.error('Reorder failed'); loadDisplayPhotos() }
  }

  // ── Tourist Places handlers ──────────────────────────────────────────────

  const handleTogglePopular = async (item) => {
    setTogglingId(item._id)
    try {
      await tourismApi.update(item._id, { isPopular: !item.isPopular })
      toast.success(item.isPopular ? 'Removed from Popular' : 'Marked as Popular')
      fetch({ page, limit: PAGE_SIZE, search: debouncedSearch, category: filterCat || undefined })
      loadPopularPlaces()
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
      await tourismApi.update(item._id, { isVerified: !item.isVerified })
      toast.success(item.isVerified ? 'Verification removed' : 'Marked as Verified')
      fetch({ page, limit: PAGE_SIZE, search: debouncedSearch, category: filterCat || undefined })
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update')
    } finally { setTogglingVerifiedId(null) }
  }

  const handleReplaceConfirm = async (replaceId) => {
    if (!replacePendingItem) return
    setReplacingId(replaceId)
    try {
      await tourismApi.update(replacePendingItem._id, { isPopular: true, replaceId })
      toast.success('Marked as Popular — replaced previous item')
      setReplaceOpen(false); setReplaceCandidates([]); setReplacePendingItem(null)
      fetch({ page, limit: PAGE_SIZE, search: debouncedSearch, category: filterCat || undefined })
      loadPopularPlaces()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to update') }
    finally { setReplacingId(null) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await tourismApi.delete(deleteId)
      toast.success('Moved to Recycle Bin')
      setDeleteId(null)
      loadPopularPlaces()
      fetch()
    }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = async () => {
    setFormEditId(null); setReservedId(null)
    setFormDefaults({}); setFormOpen(true)
    try { const r = await uploadApi.reserveId('TUR'); setReservedId(r.data.data.id) }
    catch { toast.error('Failed to reserve ID — please try again'); setFormOpen(false) }
  }

  const openEdit = async (id) => {
    setFormFetching(true); setFormDefaults(null); setFormEditId(id); setFormOpen(true)
    try { const r = await tourismApi.getById(id); setFormDefaults(r.data.data) }
    catch { toast.error('Failed to load'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true)
    try {
      if (formEditId) { await tourismApi.update(formEditId, formData); toast.success('Updated!') }
      else            { await tourismApi.create(reservedId ? { ...formData, _reservedId: reservedId } : formData); toast.success('Created!') }
      setFormOpen(false); setReservedId(null)
      fetch({ page, limit: PAGE_SIZE, search: debouncedSearch, category: filterCat || undefined })
      loadPopularPlaces()
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setFormSubmitting(false) }
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
      accessorKey: 'placeName',
      header: 'Place',
      cell: ({ getValue }) => <span className="font-medium text-slate-800">{truncate(getValue() || '', 35)}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => {
        const cat = categories.find(c => c._id === getValue())
        return <span className="text-slate-500 text-xs">{cat?.name || getValue() || '—'}</span>
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
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
      id: 'isPopular',
      header: 'Popular',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ToggleSwitch
            checked={!!row.original.isPopular}
            onChange={() => handleTogglePopular(row.original)}
            loading={togglingId === row.original._id}
          />
          {row.original.isPopular && <Star className="w-3.5 h-3.5 text-purple-400" />}
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
        title="Tourism"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}
          >
            <Plus className="w-4 h-4" /> Add Place
          </button>
        }
      />

      {/* Section 1 — Top 3 Display Photos */}
      <div className="rounded-xl p-5 mb-6" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800">Top Display Photos</h3>
            <p className="text-xs text-slate-500 mt-0.5">Exactly 3 photos shown at the top of the user site — drag to reorder</p>
          </div>
          {displayPhotos.length < 3 && (
            <button
              onClick={handleAddPhoto}
              disabled={photoUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all hover:opacity-90 disabled:opacity-50 text-white"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}
            >
              {photoUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Photo
            </button>
          )}
        </div>

        {photosLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 rounded-full animate-spin" style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePhotoDragEnd}>
            <SortableContext items={displayPhotos.map(p => p._id)} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-3 flex-wrap">
                {displayPhotos.map((photo, idx) => (
                  <SortablePhotoSlot
                    key={photo._id}
                    photo={photo}
                    index={idx}
                    onReplace={handleReplacePhoto}
                    onDelete={(id) => setDeletePhotoId(id)}
                  />
                ))}
                {displayPhotos.length === 0 && (
                  <div className="text-sm text-slate-400 py-4">No display photos yet — add up to 3 photos</div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Section 2 — Popular Destinations */}
      <div className="rounded-xl p-4 mb-5" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-purple-500 shrink-0" />
          <h3 className="font-semibold text-purple-800 text-sm">Popular Destinations</h3>
          <span className="text-xs text-purple-600 ml-1">
            {popularLoading ? '…' : `${popularPlaces.length} pinned`} · max 10 globally shown on user side
          </span>
        </div>
        {popularLoading ? (
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-36 h-14 rounded-lg animate-pulse" style={{ background: '#EDE9FE' }} />
            ))}
          </div>
        ) : popularPlaces.length === 0 ? (
          <p className="text-xs text-purple-400 italic">No Popular Destinations yet — toggle the switch on any place to pin it here.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {popularPlaces.map((p) => {
              const cat = categories.find(c => c._id === p.category)
              return (
                <div
                  key={p._id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: '#EDE9FE', border: '1px solid #DDD6FE' }}
                >
                  {p.thumbnail && (
                    <img src={p.thumbnail} className="w-10 h-8 object-cover rounded shrink-0" alt="" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-purple-900 truncate max-w-30">{p.placeName || p.title}</p>
                    {cat && <p className="text-xs text-purple-400 truncate">{cat.name}</p>}
                  </div>
                  <button
                    onClick={() => openEdit(p._id)}
                    title="Edit"
                    className="p-1 rounded text-purple-600 transition-colors shrink-0"
                    onMouseEnter={(e) => e.currentTarget.style.background = '#DDD6FE'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Section 3 — Tourist Places */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-700">Tourist Places</h3>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-purple-700"
          style={{ background: '#F3E8FF', border: '1px solid #E9D5FF' }}>
          <Star className="w-3 h-3" />
          Max 10 Popular globally
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div>
          <label htmlFor="search-tourism" className="sr-only">Search places</label>
          <input
            id="search-tourism" name="search" autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search places…"
            className={`${inp} w-full sm:w-64`}
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          />
        </div>
        <div>
          <label htmlFor="filter-tourism-cat" className="sr-only">Filter by category</label>
          <select
            id="filter-tourism-cat" name="filterCategory"
            value={filterCat}
            onChange={(e) => { setFilterCat(e.target.value); setPage(1) }}
            className={inp}
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
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

      {/* Hidden file inputs */}
      <input ref={photoUploadRef}  type="file" accept="image/*" className="hidden"
        onChange={(e) => handlePhotoUpload(e, null)} />
      <input ref={photoReplaceRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { handlePhotoUpload(e, replacingPhoto); setReplacingPhoto(null) }} />

      {/* Delete display photo confirm */}
      <ConfirmModal
        isOpen={!!deletePhotoId}
        title="Delete Display Photo"
        message="This will permanently remove the display photo."
        onConfirm={handleDeletePhoto}
        onCancel={() => setDeletePhotoId(null)}
        loading={deletingPhoto}
      />

      {/* Delete tourist place confirm */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Tourism Place"
        message="This will move the place to the Recycle Bin. You can restore it within 15 days."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      {/* Form modal */}
      <FormModal isOpen={formOpen} onClose={() => setFormOpen(false)}
        title={formEditId ? 'Edit Tourism Place' : 'Add Tourism Place'}
        maxWidth="max-w-3xl">
        {(formFetching || formDefaults === null) ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
          </div>
        ) : (
          <TourismForm
            defaultValues={formDefaults}
            onSubmit={handleFormSubmit}
            loading={formSubmitting}
            contentId={formEditId || reservedId}
          />
        )}
      </FormModal>

      {/* RULE 13 — Replace prompt for isPopular max 10 globally */}
      {replaceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Max Popular Destinations Reached</h3>
            <p className="text-sm text-slate-500 mb-4">
              There are already 10 Popular destinations. Choose one to replace:
            </p>
            <div className="flex flex-col gap-2 mb-5 max-h-64 overflow-y-auto">
              {replaceCandidates.map((c) => (
                <button
                  key={c._id}
                  onClick={() => handleReplaceConfirm(c._id)}
                  disabled={!!replacingId}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all"
                  style={{ borderColor: replacingId === c._id ? P : '#E2E8F0', background: replacingId === c._id ? PB : '#FAFAFA' }}
                >
                  {c.thumbnail && <img src={c.thumbnail} className="w-10 h-8 object-cover rounded-lg shrink-0" alt="" />}
                  <span className="text-sm font-medium text-slate-700 line-clamp-2">{c.placeName || c.title}</span>
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
