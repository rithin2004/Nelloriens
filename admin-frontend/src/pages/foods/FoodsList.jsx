import { useRef, useState, useEffect, useCallback } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useForm } from 'react-hook-form'
import {
  Upload, Loader, X, Plus, Pencil, Trash2, Star, GripVertical,
  UtensilsCrossed, Camera, HeartPulse, Eye,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { foodsApi, uploadApi } from '../../services/api'
import useFoodsStore from '../../store/foodsStore'
import useAnalyticsStore from '../../store/analyticsStore'
import PageHeader from '../../components/common/PageHeader'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormModal from '../../components/common/FormModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const MAX_PHOTOS  = 5
const MAX_SWEETS  = 8
const MAX_POPULAR = 6

const inp = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white text-slate-800'
const lbl = 'block text-xs font-semibold text-slate-500 mb-1'
const card = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }
const sectionHeader = { borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', borderRadius: '16px 16px 0 0' }

// ── Restaurant pair sub-form ──────────────────────────────────────────────────
function RestaurantFields({ register, prefix, label }) {
  return (
    <div className="p-3 rounded-xl space-y-2" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={lbl}>Name</label><input {...register(`${prefix}.name`)} placeholder="Restaurant name" className={inp} /></div>
        <div><label className={lbl}>Price (approx)</label><input {...register(`${prefix}.price`)} placeholder="₹120" className={inp} /></div>
        <div><label className={lbl}>Rating (/ 5)</label><input {...register(`${prefix}.rating`)} type="number" min="0" max="5" step="0.1" placeholder="4.2" className={inp} /></div>
        <div><label className={lbl}>Order Link (URL)</label><input {...register(`${prefix}.orderLink`)} type="url" placeholder="https://order.example.com/..." className={inp} /></div>
      </div>
    </div>
  )
}

// ── Variety form ──────────────────────────────────────────────────────────────
function VarietyForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: defaultValues || {
      name: '', popular: false, totalRestaurants: '',
      restaurants: [{ name: '', price: '', rating: '', orderLink: '' }, { name: '', price: '', rating: '', orderLink: '' }],
    },
  })
  const isPopular = watch('popular')
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div><label className={lbl}>Variety Name *</label><input {...register('name', { required: true })} placeholder="e.g. Biryani" className={inp} /></div>
      <div><label className={lbl}>Total Restaurants serving this</label><input {...register('totalRestaurants')} type="number" min="0" placeholder="e.g. 24" className={inp} /></div>
      {/* RULE 13 — toggle switch, never checkbox */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-700 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400" /> Popular
          <span className="text-xs text-slate-400">(max {MAX_POPULAR} shown on user side)</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isPopular}
          onClick={() => setValue('popular', !isPopular, { shouldDirty: true })}
          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none"
          style={{ background: isPopular ? '#F59E0B' : '#CBD5E1' }}
        >
          <span
            className="inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200"
            style={{ marginLeft: isPopular ? '18px' : '2px' }}
          />
        </button>
      </div>
      <RestaurantFields register={register} prefix="restaurants.0" label="Top Restaurant #1" />
      <RestaurantFields register={register} prefix="restaurants.1" label="Top Restaurant #2" />
      <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
        {loading ? 'Saving…' : 'Save Variety'}
      </button>
    </form>
  )
}

// ── Sweet form ────────────────────────────────────────────────────────────────
function SweetForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit } = useForm({
    defaultValues: defaultValues || {
      name: '',
      restaurants: [{ name: '', price: '', rating: '', orderLink: '' }, { name: '', price: '', rating: '', orderLink: '' }],
    },
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div><label className={lbl}>Sweet Name *</label><input {...register('name', { required: true })} placeholder="e.g. Pootharekulu" className={inp} /></div>
      <RestaurantFields register={register} prefix="restaurants.0" label="Top Restaurant #1" />
      <RestaurantFields register={register} prefix="restaurants.1" label="Top Restaurant #2" />
      <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#EC4899,#DB2777)', boxShadow: '0 4px 16px rgba(236,72,153,0.25)' }}>
        {loading ? 'Saving…' : 'Save Sweet'}
      </button>
    </form>
  )
}

// ── Health Tip form ───────────────────────────────────────────────────────────
function HealthTipForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit } = useForm({ defaultValues: defaultValues || { title: '', tip: '' } })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="ht-title" className={lbl}>Title *</label>
        <input id="ht-title" name="title" autoComplete="off"
          {...register('title', { required: true })} placeholder="e.g. Eat seasonal fruits" className={inp} />
      </div>
      <div>
        <label htmlFor="ht-tip" className={lbl}>Tip / Description *</label>
        <textarea id="ht-tip" name="tip" autoComplete="off"
          {...register('tip', { required: true })} rows={4} placeholder="Write the health tip here…" className={inp} style={{ resize: 'none' }} />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 text-white font-semibold rounded-lg disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}>
        {loading ? 'Saving…' : 'Save Tip'}
      </button>
    </form>
  )
}

// ── Sortable photo card ───────────────────────────────────────────────────────
function SortablePhoto({ photo, idx, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo._id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="relative rounded-xl overflow-hidden aspect-square" style={{ border: '2px solid #eef3fd' }}>
        <img src={photo.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
        <span className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold z-10" style={{ background: '#0a3d95' }}>{idx + 1}</span>
        <button {...attributes} {...listeners} className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none z-10" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onDelete(photo)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ background: 'rgba(220,38,38,0.9)' }}>
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FoodsList() {
  const sensors = useSensors(useSensor(PointerSensor))

  // Subscribe to foods store so SSE-triggered fetches re-refresh sub-sections
  const _sseItems = useFoodsStore(state => state.items)
  const prevSseRef = useRef(_sseItems)

  // Photos
  const [photos, setPhotos]                   = useState([])
  const [photosLoading, setPhotosLoading]     = useState(true)
  const [photoUploading, setPhotoUploading]   = useState(false)
  const [deletePhoto, setDeletePhoto]         = useState(null)
  const [deletingPhoto, setDeletingPhoto]     = useState(false)
  const photoInputRef = useRef(null)

  // Varieties
  const [varieties, setVarieties]             = useState([])
  const [varietiesLoading, setVarietiesLoading] = useState(true)
  const [varietyFormOpen, setVarietyFormOpen] = useState(false)
  const [varietyDefaults, setVarietyDefaults] = useState(null)
  const [varietyEditId, setVarietyEditId]     = useState(null)
  const [varietySaving, setVarietySaving]     = useState(false)
  const [deleteVarietyId, setDeleteVarietyId] = useState(null)
  const [deletingVariety, setDeletingVariety] = useState(false)
  const [togglingId,         setTogglingId]         = useState(null)
  const [togglingVerifiedId, setTogglingVerifiedId] = useState(null)
  // Replace prompt for isPopular max 6 (RULE 13)
  const [replaceOpen,        setReplaceOpen]        = useState(false)
  const [replaceCandidates,  setReplaceCandidates]  = useState([])
  const [replacePendingVar,  setReplacePendingVar]  = useState(null)
  const [replacingId,        setReplacingId]        = useState(null)

  // Sweets
  const [sweets, setSweets]                   = useState([])
  const [sweetsLoading, setSweetsLoading]     = useState(true)
  const [sweetFormOpen, setSweetFormOpen]     = useState(false)
  const [sweetDefaults, setSweetDefaults]     = useState(null)
  const [sweetEditId, setSweetEditId]         = useState(null)
  const [sweetSaving, setSweetSaving]         = useState(false)
  const [deleteSweetId, setDeleteSweetId]     = useState(null)
  const [deletingSweet, setDeletingSweet]     = useState(false)

  // Health Tips
  const [healthTips, setHealthTips]             = useState([])
  const [tipsLoading, setTipsLoading]           = useState(true)
  const [tipSearch, setTipSearch]               = useState('')
  const [tipFormOpen, setTipFormOpen]           = useState(false)
  const [tipDefaults, setTipDefaults]           = useState(null)
  const [tipEditId, setTipEditId]               = useState(null)
  const [tipSaving, setTipSaving]               = useState(false)
  const [deleteTipId, setDeleteTipId]           = useState(null)
  const [deletingTip, setDeletingTip]           = useState(false)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPhotos     = useCallback(() => { setPhotosLoading(true);    foodsApi.getPhotos().then((r)    => setPhotos(r.data.data    || [])).catch(() => {}).finally(() => setPhotosLoading(false)) },    [])
  const fetchVarieties  = useCallback(() => { setVarietiesLoading(true); foodsApi.getVarieties().then((r) => setVarieties(r.data.data || [])).catch(() => {}).finally(() => setVarietiesLoading(false)) }, [])
  const fetchSweets     = useCallback(() => { setSweetsLoading(true);    foodsApi.getSweets().then((r)    => setSweets(r.data.data    || [])).catch(() => {}).finally(() => setSweetsLoading(false)) },    [])
  const fetchHealthTips = useCallback((search = '') => {
    setTipsLoading(true)
    foodsApi.getHealthTips({ search }).then((r) => setHealthTips(r.data.data || [])).catch(() => {}).finally(() => setTipsLoading(false))
  }, [])

  useEffect(() => { fetchPhotos(); fetchVarieties(); fetchSweets(); fetchHealthTips() }, [fetchPhotos, fetchVarieties, fetchSweets, fetchHealthTips])

  // SSE refresh: when store items change (SSE triggered), re-fetch all sub-sections
  useEffect(() => {
    if (_sseItems === prevSseRef.current) return
    prevSseRef.current = _sseItems
    fetchPhotos(); fetchVarieties(); fetchSweets(); fetchHealthTips(tipSearch)
  }, [_sseItems, fetchPhotos, fetchVarieties, fetchSweets, fetchHealthTips, tipSearch])

  // ── Photos handlers ───────────────────────────────────────────────────────
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || photos.length >= MAX_PHOTOS) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }
    setPhotoUploading(true)
    try {
      const idRes = await uploadApi.reserveId('FPH')
      const photoId = idRes.data.data.id
      const fd = new FormData()
      fd.append('file', file)
      fd.append('contentId', photoId)
      fd.append('section', 'gallery')
      const res = await uploadApi.upload('foods', fd)
      await foodsApi.addPhoto({ url: res.data.data.url, _reservedId: photoId })
      toast.success('Photo added')
      fetchPhotos()
    } catch { toast.error('Upload failed') }
    finally { setPhotoUploading(false); if (photoInputRef.current) photoInputRef.current.value = '' }
  }

  const handleDeletePhoto = async () => {
    setDeletingPhoto(true)
    try {
      await foodsApi.deletePhoto(deletePhoto._id)
      try { await uploadApi.delete(deletePhoto.url) } catch { /* ignore storage delete errors */ }
      toast.success('Photo removed'); setDeletePhoto(null); fetchPhotos()
    } catch { toast.error('Delete failed') }
    finally { setDeletingPhoto(false) }
  }

  const handlePhotoDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return
    const newOrder = arrayMove(photos, photos.findIndex(p => p._id === active.id), photos.findIndex(p => p._id === over.id))
    setPhotos(newOrder)
    try { await foodsApi.reorderPhotos(newOrder.map((p) => p._id)) }
    catch { toast.error('Reorder failed'); fetchPhotos() }
  }

  // ── Variety handlers ──────────────────────────────────────────────────────
  const openVarietyCreate = () => { setVarietyDefaults({}); setVarietyEditId(null); setVarietyFormOpen(true) }
  const openVarietyEdit   = (v) => { setVarietyDefaults(v); setVarietyEditId(v._id); setVarietyFormOpen(true) }

  const handleVarietySubmit = async (data) => {
    setVarietySaving(true)
    try {
      if (varietyEditId) { await foodsApi.updateVariety(varietyEditId, data); toast.success('Variety updated!') }
      else               { await foodsApi.createVariety(data);                toast.success('Variety added!') }
      setVarietyFormOpen(false); fetchVarieties()
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setVarietySaving(false) }
  }

  const handleDeleteVariety = async () => {
    setDeletingVariety(true)
    try { await foodsApi.deleteVariety(deleteVarietyId); setDeleteVarietyId(null); toast.success('Deleted'); fetchVarieties() }
    catch { toast.error('Delete failed') }
    finally { setDeletingVariety(false) }
  }

  const handleTogglePopular = async (v) => {
    setTogglingId(v._id)
    try {
      await foodsApi.updateVariety(v._id, { popular: !v.popular })
      toast.success(v.popular ? 'Removed from popular' : 'Marked as popular')
      fetchVarieties()
    } catch (e) {
      // RULE 13 — max 6 popular varieties globally: show replace prompt
      if (e?.response?.data?.code === 'MAX_LIMIT_REACHED') {
        setReplaceCandidates(e.response.data.currentItems || [])
        setReplacePendingVar(v)
        setReplaceOpen(true)
      } else {
        toast.error(e?.response?.data?.message || 'Update failed')
      }
    } finally { setTogglingId(null) }
  }

  const handleToggleVerifiedVariety = async (v) => {
    setTogglingVerifiedId(v._id)
    try {
      await foodsApi.updateVariety(v._id, { isVerified: !v.isVerified })
      toast.success(v.isVerified ? 'Verification removed' : 'Marked as Verified')
      fetchVarieties()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed')
    } finally { setTogglingVerifiedId(null) }
  }

  const handlePopularReplaceConfirm = async (replaceId) => {
    if (!replacePendingVar) return
    setReplacingId(replaceId)
    try {
      await foodsApi.updateVariety(replacePendingVar._id, { popular: true, replaceId })
      toast.success('Marked as popular — replaced previous item')
      setReplaceOpen(false); setReplaceCandidates([]); setReplacePendingVar(null)
      fetchVarieties()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update')
    } finally { setReplacingId(null) }
  }

  // ── Sweet handlers ────────────────────────────────────────────────────────
  const openSweetCreate = () => { setSweetDefaults({}); setSweetEditId(null); setSweetFormOpen(true) }
  const openSweetEdit   = (s) => { setSweetDefaults(s); setSweetEditId(s._id); setSweetFormOpen(true) }

  const handleSweetSubmit = async (data) => {
    setSweetSaving(true)
    try {
      if (sweetEditId) { await foodsApi.updateSweet(sweetEditId, data); toast.success('Sweet updated!') }
      else             { await foodsApi.createSweet(data);               toast.success('Sweet added!') }
      setSweetFormOpen(false); fetchSweets()
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setSweetSaving(false) }
  }

  const handleDeleteSweet = async () => {
    setDeletingSweet(true)
    try { await foodsApi.deleteSweet(deleteSweetId); setDeleteSweetId(null); toast.success('Deleted'); fetchSweets() }
    catch { toast.error('Delete failed') }
    finally { setDeletingSweet(false) }
  }

  // ── Health Tip handlers ───────────────────────────────────────────────────
  const openTipCreate = () => { setTipDefaults({}); setTipEditId(null); setTipFormOpen(true) }
  const openTipEdit   = (t) => { setTipDefaults(t); setTipEditId(t._id); setTipFormOpen(true) }

  const handleTipSubmit = async (data) => {
    setTipSaving(true)
    try {
      if (tipEditId) { await foodsApi.updateHealthTip(tipEditId, data); toast.success('Tip updated!') }
      else           { await foodsApi.createHealthTip(data);             toast.success('Tip added!') }
      setTipFormOpen(false); fetchHealthTips(tipSearch)
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setTipSaving(false) }
  }

  const handleDeleteTip = async () => {
    setDeletingTip(true)
    try { await foodsApi.deleteHealthTip(deleteTipId); setDeleteTipId(null); toast.success('Deleted'); fetchHealthTips(tipSearch) }
    catch { toast.error('Delete failed') }
    finally { setDeletingTip(false) }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const { pageViews: analyticsPageViews, loaded: analyticsLoaded, fetch: fetchAnalytics } = useAnalyticsStore()
  useEffect(() => { if (!analyticsLoaded) fetchAnalytics() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const totalPageViews = analyticsPageViews['foods'] || 0

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Foods" pageViews={totalPageViews} />

      {/* ══ SECTION 1 — PHOTOS ══ */}
      <div style={card}>
        <div className="flex items-center justify-between px-5 py-4" style={sectionHeader}>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-sky-500" />
            <h2 className="font-bold text-slate-700">Food Photos</h2>
            <span className="text-xs text-slate-400">{photos.length}/{MAX_PHOTOS} · drag to reorder</span>
          </div>
          {photos.length < MAX_PHOTOS && (
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={photoUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg,#0a3d95,#072d6e)', boxShadow: '0 4px 10px rgba(10,61,149,0.25)' }}
            >
              {photoUploading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {photoUploading ? 'Uploading…' : 'Add Photo'}
            </button>
          )}
          <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
        </div>

        <div className="p-5">
          {photosLoading ? <LoadingSpinner /> : photos.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-14 rounded-xl cursor-pointer transition-all"
              style={{ border: '2px dashed #dce8fb', background: '#eef3fd' }}
              onClick={() => photoInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-sky-300 mb-2" />
              <p className="text-sm text-slate-400">Click to upload the first food photo</p>
              <p className="text-xs text-slate-300 mt-1">Up to {MAX_PHOTOS} photos shown in numbered order</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePhotoDragEnd}>
              <SortableContext items={photos.map(p => p._id)} strategy={horizontalListSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {photos.map((photo, idx) => (
                    <SortablePhoto key={photo._id} photo={photo} idx={idx} onDelete={setDeletePhoto} />
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      disabled={photoUploading}
                      className="flex flex-col items-center justify-center rounded-xl aspect-square transition-all disabled:opacity-50"
                      style={{ border: '2px dashed #dce8fb', background: '#eef3fd' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0a3d95'; e.currentTarget.style.background = '#eef3fd' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#dce8fb'; e.currentTarget.style.background = '#eef3fd' }}
                    >
                      {photoUploading ? <Loader className="w-5 h-5 animate-spin text-sky-400" /> : <Plus className="w-5 h-5 text-sky-400" />}
                      <span className="text-xs mt-1 text-slate-400">{photoUploading ? 'Uploading…' : 'Add'}</span>
                    </button>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* ══ SECTION 2 — VARIETIES ══ */}
      <div style={card}>
        <div className="flex items-center justify-between px-5 py-4" style={sectionHeader}>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-purple-500" />
            <h2 className="font-bold text-slate-700">Varieties of Food</h2>
            <span className="text-xs text-slate-400">{varieties.length} total · max {MAX_POPULAR} popular shown</span>
          </div>
          <button
            onClick={openVarietyCreate}
            className="btn-shine flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 10px rgba(139,92,246,0.25)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Variety
          </button>
        </div>

        <div className="p-5">
          {/* Popular Varieties pinned summary */}
          {!varietiesLoading && varieties.filter(v => v.popular).length > 0 && (
            <div className="mb-4 p-3 rounded-xl" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 text-amber-400 shrink-0" />
                Popular Varieties &nbsp;({varieties.filter(v => v.popular).length}/{MAX_POPULAR})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {varieties.filter(v => v.popular).map((v) => (
                  <span key={v._id} className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: '#FEF3C7', color: '#92400E' }}>
                    {v.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {varietiesLoading ? <LoadingSpinner /> : varieties.length === 0 ? (
            <div className="text-center py-10 rounded-xl" style={{ border: '1px dashed #CBD5E1' }}>
              <p className="text-sm text-slate-400">No varieties yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {varieties.map((v) => (
                <div key={v._id} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: '#FAFAFA', border: '1px solid #E2E8F0' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800">{v.name}</p>
                      {v.popular && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#FEF3C7', color: '#92400E' }}>
                          <Star className="w-3 h-3 text-amber-400" /> Popular
                        </span>
                      )}
                      {v.totalRestaurants && (
                        <span className="text-xs text-slate-400">{v.totalRestaurants} restaurants</span>
                      )}
                    </div>
                    {v.restaurants?.filter(r => r.name).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {v.restaurants.filter(r => r.name).map((r, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs" style={{ background: '#eef3fd', border: '1px solid #dce8fb' }}>
                            <span className="font-medium text-slate-700">{r.name}</span>
                            {r.price  && <span className="text-slate-400">· {r.price}</span>}
                            {r.rating && <span className="text-amber-500 font-semibold">★ {r.rating}</span>}
                            {r.orderLink && <a href={r.orderLink} target="_blank" rel="noreferrer" className="text-sky-500 hover:underline">Order</a>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-slate-400 text-xs mr-1">
                      <Eye className="w-3 h-3" /> {v.cardViews ?? 0}
                    </span>
                    {/* Popular toggle */}
                    <button
                      onClick={() => handleTogglePopular(v)}
                      disabled={togglingId === v._id}
                      title={v.popular ? 'Remove from popular' : 'Mark as popular'}
                      className="relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors duration-200 disabled:opacity-40"
                      style={{ background: v.popular ? '#F59E0B' : '#CBD5E1' }}
                    >
                      <span className="inline-block h-4 w-4 mt-0.5 transform rounded-full bg-white shadow transition-transform duration-200" style={{ marginLeft: v.popular ? '18px' : '2px' }} />
                    </button>
                    {/* Verified toggle */}
                    <button
                      onClick={() => handleToggleVerifiedVariety(v)}
                      disabled={togglingVerifiedId === v._id}
                      title={v.isVerified ? 'Remove Verification' : 'Mark as Verified'}
                      className="relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors duration-200 disabled:opacity-40"
                      style={{ background: v.isVerified ? '#10B981' : '#CBD5E1' }}
                    >
                      <span className="inline-block h-4 w-4 mt-0.5 transform rounded-full bg-white shadow transition-transform duration-200" style={{ marginLeft: v.isVerified ? '18px' : '2px' }} />
                    </button>
                    <button onClick={() => openVarietyEdit(v)} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.background = '#eef3fd'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteVarietyId(v._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors" onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ SECTION 3 — SWEETS ══ */}
      <div style={card}>
        <div className="flex items-center justify-between px-5 py-4" style={sectionHeader}>
          <div className="flex items-center gap-2">
            <span className="text-lg">🍬</span>
            <h2 className="font-bold text-slate-700">Sweets</h2>
            <span className="text-xs text-slate-400">{sweets.length}/{MAX_SWEETS}</span>
          </div>
          <button
            onClick={openSweetCreate}
            disabled={sweets.length >= MAX_SWEETS}
            className="btn-shine flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg,#EC4899,#DB2777)', boxShadow: '0 4px 10px rgba(236,72,153,0.2)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Sweet
          </button>
        </div>

        <div className="p-5">
          {sweetsLoading ? <LoadingSpinner /> : sweets.length === 0 ? (
            <div className="text-center py-10 rounded-xl" style={{ border: '1px dashed #CBD5E1' }}>
              <p className="text-sm text-slate-400">No sweets yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sweets.map((s) => (
                <div key={s._id} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: '#FAFAFA', border: '1px solid #E2E8F0' }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{s.name}</p>
                    {s.restaurants?.filter(r => r.name).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {s.restaurants.filter(r => r.name).map((r, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs" style={{ background: '#FDF2F8', border: '1px solid #FBCFE8' }}>
                            <span className="font-medium text-slate-700">{r.name}</span>
                            {r.price  && <span className="text-slate-400">· {r.price}</span>}
                            {r.rating && <span className="text-pink-500 font-semibold">★ {r.rating}</span>}
                            {r.orderLink && <a href={r.orderLink} target="_blank" rel="noreferrer" className="text-sky-500 hover:underline">Order</a>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="flex items-center gap-1 text-slate-400 text-xs mr-1">
                      <Eye className="w-3 h-3" /> {s.cardViews ?? 0}
                    </span>
                    <button onClick={() => openSweetEdit(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.background = '#eef3fd'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteSweetId(s._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors" onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ SECTION 4 — HEALTH TIPS ══ */}
      <div style={card}>
        <div className="flex items-center justify-between px-5 py-4" style={sectionHeader}>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-500" />
            <h2 className="font-bold text-slate-700">Healthy Foods / Tips</h2>
            <span className="text-xs text-slate-400">{healthTips.length} total</span>
          </div>
          <button
            onClick={openTipCreate}
            className="btn-shine flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg"
            style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 10px rgba(16,185,129,0.25)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Tip
          </button>
        </div>

        <div className="px-5 pt-4">
          <label htmlFor="tip-search" className="sr-only">Search health tips</label>
          <input
            id="tip-search" name="tipSearch" autoComplete="off"
            value={tipSearch}
            onChange={(e) => { setTipSearch(e.target.value); fetchHealthTips(e.target.value) }}
            placeholder="Search tips…"
            className="w-full sm:w-64 px-3 py-2 text-sm rounded-lg"
            style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }}
          />
        </div>

        <div className="p-5">
          {tipsLoading ? <LoadingSpinner /> : healthTips.length === 0 ? (
            <div className="text-center py-10 rounded-xl" style={{ border: '1px dashed #CBD5E1' }}>
              <p className="text-sm text-slate-400">No health tips yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {healthTips.map((t) => (
                <div key={t._id} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: '#FAFAFA', border: '1px solid #E2E8F0' }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{t.title}</p>
                    {t.tip && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{t.tip}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="flex items-center gap-1 text-slate-400 text-xs mr-1">
                      <Eye className="w-3 h-3" /> {t.cardViews ?? 0}
                    </span>
                    <button onClick={() => openTipEdit(t)} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.background = '#eef3fd'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTipId(t._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors" onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm modals ── */}
      <ConfirmModal isOpen={!!deletePhoto}      title="Remove Photo"    message="Remove this photo?"         onConfirm={handleDeletePhoto}    onCancel={() => setDeletePhoto(null)}      loading={deletingPhoto} />
      <ConfirmModal isOpen={!!deleteVarietyId}  title="Delete Variety"  message="Delete this variety?"       onConfirm={handleDeleteVariety}  onCancel={() => setDeleteVarietyId(null)}  loading={deletingVariety} />
      <ConfirmModal isOpen={!!deleteSweetId}    title="Delete Sweet"    message="Delete this sweet?"         onConfirm={handleDeleteSweet}    onCancel={() => setDeleteSweetId(null)}    loading={deletingSweet} />
      <ConfirmModal isOpen={!!deleteTipId}      title="Delete Health Tip" message="Delete this health tip?" onConfirm={handleDeleteTip}      onCancel={() => setDeleteTipId(null)}      loading={deletingTip} />

      {/* ── Variety form modal ── */}
      <FormModal isOpen={varietyFormOpen} onClose={() => setVarietyFormOpen(false)} title={varietyEditId ? 'Edit Variety' : 'Add Variety'}>
        <VarietyForm defaultValues={varietyDefaults} onSubmit={handleVarietySubmit} loading={varietySaving} />
      </FormModal>

      {/* ── Sweet form modal ── */}
      <FormModal isOpen={sweetFormOpen} onClose={() => setSweetFormOpen(false)} title={sweetEditId ? 'Edit Sweet' : 'Add Sweet'}>
        <SweetForm defaultValues={sweetDefaults} onSubmit={handleSweetSubmit} loading={sweetSaving} />
      </FormModal>

      {/* ── Health Tip form modal ── */}
      <FormModal isOpen={tipFormOpen} onClose={() => setTipFormOpen(false)} title={tipEditId ? 'Edit Health Tip' : 'Add Health Tip'}>
        <HealthTipForm defaultValues={tipDefaults} onSubmit={handleTipSubmit} loading={tipSaving} />
      </FormModal>

      {/* RULE 13 — Replace prompt for popular max 6 globally */}
      {replaceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Max Popular Reached</h3>
            <p className="text-sm text-slate-500 mb-4">
              Already 6 Popular varieties. Choose one to replace:
            </p>
            <div className="flex flex-col gap-2 mb-5">
              {replaceCandidates.map((c) => (
                <button
                  key={c._id}
                  onClick={() => handlePopularReplaceConfirm(c._id)}
                  disabled={!!replacingId}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all"
                  style={{ borderColor: replacingId === c._id ? '#8B5CF6' : '#E2E8F0', background: replacingId === c._id ? '#EDE9FE' : '#FAFAFA' }}
                >
                  <span className="text-sm font-medium text-slate-700">{c.name}</span>
                  {replacingId === c._id && (
                    <div className="ml-auto w-4 h-4 rounded-full animate-spin shrink-0" style={{ border: '2px solid #DDD6FE', borderTopColor: '#8B5CF6' }} />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setReplaceOpen(false); setReplaceCandidates([]); setReplacePendingVar(null) }}
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
