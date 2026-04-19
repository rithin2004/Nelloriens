import { useRef, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { Plus, Trash2, Star, Upload, Loader, X } from 'lucide-react'
import RichTextEditor from '../common/RichTextEditor'
import ImageUpload from '../common/ImageUpload'
import MapPicker from '../common/MapPicker'
import { uploadApi } from '../../services/api'
import toast from 'react-hot-toast'

const lbl = 'block text-sm font-medium text-slate-700 mb-1'
const inp = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

const MAX_PHOTOS   = 5
const MAX_SWEETS   = 8
const MAX_POPULAR  = 6  // user-side display limit

function ToggleSwitch({ id, checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} id={id}
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center rounded-full transition-colors w-10 h-6 shrink-0"
      style={{ background: checked ? '#10B981' : '#D1D5DB' }}>
      <span className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
    </button>
  )
}

function RestaurantPair({ register, prefix, label }) {
  const safeId = prefix.replace(/[.[\]]/g, '-')
  return (
    <div className="p-3 rounded-lg space-y-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${safeId}-name`} className={lbl}>Restaurant Name</label>
          <input id={`${safeId}-name`} autoComplete="organization" {...register(`${prefix}.name`)} placeholder="e.g. Hotel Vijaya" className={inp} />
        </div>
        <div>
          <label htmlFor={`${safeId}-link`} className={lbl}>Order Link (URL)</label>
          <input id={`${safeId}-link`} autoComplete="url" {...register(`${prefix}.orderLink`)} type="url" placeholder="https://…" className={inp} />
        </div>
        <div>
          <label htmlFor={`${safeId}-price`} className={lbl}>Price (approx.)</label>
          <input id={`${safeId}-price`} autoComplete="off" {...register(`${prefix}.price`)} placeholder="e.g. ₹120" className={inp} />
        </div>
        <div>
          <label htmlFor={`${safeId}-rating`} className={lbl}>Rating (out of 5)</label>
          <input id={`${safeId}-rating`} autoComplete="off" {...register(`${prefix}.rating`)} type="number" min="0" max="5" step="0.1" placeholder="e.g. 4.2" className={inp} />
        </div>
      </div>
    </div>
  )
}

export default function FoodForm({ defaultValues, onSubmit, loading, contentId }) {
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    defaultValues: {
      ...defaultValues,
      photos:    defaultValues?.photos    || [],
      varieties: defaultValues?.varieties || [],
      sweets:    defaultValues?.sweets    || [],
    },
  })

  const [description, setDescription] = useState(defaultValues?.description || '')
  const [location, setLocation]       = useState({ lat: defaultValues?.latitude, lng: defaultValues?.longitude })
  const [photos, setPhotos]           = useState(defaultValues?.photos || [])
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoInputRef = useRef(null)

  // Varieties & Sweets via useFieldArray
  const { fields: varietyFields, append: appendVariety, remove: removeVariety } = useFieldArray({ control, name: 'varieties' })
  const { fields: sweetFields,   append: appendSweet,   remove: removeSweet   } = useFieldArray({ control, name: 'sweets' })
  const watchedVarieties = useWatch({ control, name: 'varieties' })

  const handleMapChange = ({ lat, lng }) => {
    setLocation({ lat, lng })
    setValue('latitude', lat)
    setValue('longitude', lng)
  }

  const handlePhotoFile = async (e) => {
    const file = e.target.files[0]
    if (!file || photos.length >= MAX_PHOTOS) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }
    const fd = new FormData()
    fd.append('file', file)
    if (contentId) fd.append('contentId', contentId)
    fd.append('section', 'photos')
    fd.append('index', String(photos.length + 1))
    setPhotoUploading(true)
    try {
      const res = await uploadApi.upload('foods', fd)
      const next = [...photos, res.data.data.url]
      setPhotos(next)
      setValue('photos', next)
    } catch { toast.error('Upload failed') }
    finally { setPhotoUploading(false); if (photoInputRef.current) photoInputRef.current.value = '' }
  }

  const removePhoto = async (idx) => {
    try { await uploadApi.delete(photos[idx]) } catch { /* ignore storage delete errors */ }
    const next = photos.filter((_, i) => i !== idx)
    setPhotos(next)
    setValue('photos', next)
  }

  const submit = (data) => {
    onSubmit({ ...data, description, photos, latitude: location.lat, longitude: location.lng })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {/* ── Basic Info ── */}
      <div className={section}>
        <h3 className="font-semibold text-slate-800">Food Details</h3>
        <div>
          <label htmlFor="fod-name" className={lbl}>Food Name *</label>
          <input id="fod-name" name="foodName" autoComplete="off" {...register('foodName', { required: 'Required' })} className={inp} />
          {errors.foodName && <p className="text-xs text-red-600 mt-1">{errors.foodName.message}</p>}
        </div>
        <div>
          <label htmlFor="fod-restaurant" className={lbl}>Restaurant / Place Name *</label>
          <input id="fod-restaurant" name="restaurantName" autoComplete="organization" {...register('restaurantName', { required: 'Required' })} className={inp} />
          {errors.restaurantName && <p className="text-xs text-red-600 mt-1">{errors.restaurantName.message}</p>}
        </div>
        <div><p className={lbl}>Description *</p><RichTextEditor value={description} onChange={setDescription} /></div>
      </div>

      {/* ── Photos (max 5) ── */}
      <div className={section}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-slate-800">Photos</h3>
          <span className="text-xs text-slate-400">{photos.length}/{MAX_PHOTOS}</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">Photos are shown in this numbered order on the user side.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {photos.map((url, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square" style={{ border: '2px solid #dce8fb' }}>
              <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              {/* Number badge */}
              <span className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'rgba(10,61,149,0.85)' }}>{idx + 1}</span>
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(220,38,38,0.85)' }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={photoUploading}
              className="flex flex-col items-center justify-center rounded-xl aspect-square transition-all disabled:opacity-50"
              style={{ background: '#eef3fd', border: '2px dashed #dce8fb' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0a3d95'; e.currentTarget.style.background = '#dce8fb' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#dce8fb'; e.currentTarget.style.background = '#eef3fd' }}
            >
              {photoUploading
                ? <Loader className="w-5 h-5 animate-spin text-sky-500" />
                : <Upload className="w-5 h-5 text-sky-400" />}
              <span className="text-xs mt-1 text-slate-400">{photoUploading ? 'Uploading…' : 'Add Photo'}</span>
            </button>
          )}
        </div>
        <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoFile} />
      </div>

      {/* ── Location ── */}
      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location</h3>
        <MapPicker lat={location.lat} lng={location.lng} onChange={handleMapChange} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fod-lat" className={lbl}>Latitude</label>
            <input id="fod-lat" name="latitude" autoComplete="off" {...register('latitude')} type="number" step="any" readOnly className={inp} />
          </div>
          <div>
            <label htmlFor="fod-lng" className={lbl}>Longitude</label>
            <input id="fod-lng" name="longitude" autoComplete="off" {...register('longitude')} type="number" step="any" readOnly className={inp} />
          </div>
        </div>
        <div>
          <label htmlFor="fod-address" className={lbl}>Address</label>
          <input id="fod-address" name="address" autoComplete="street-address" {...register('address')} className={inp} />
        </div>
        <div>
          <label htmlFor="fod-mapsurl" className={lbl}>Google Maps URL</label>
          <input id="fod-mapsurl" name="googleMapsUrl" type="url" autoComplete="url" {...register('googleMapsUrl')} placeholder="https://maps.google.com/…" className={inp} />
        </div>
      </div>

      {/* ── More Info ── */}
      <div className={section}>
        <h3 className="font-semibold text-slate-800">More Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fod-pricerange" className={lbl}>Price Range</label>
            <select id="fod-pricerange" name="priceRange" autoComplete="off" {...register('priceRange')} className={inp}>
              <option value="">Select</option>
              <option value="₹">₹</option>
              <option value="₹₹">₹₹</option>
              <option value="₹₹₹">₹₹₹</option>
            </select>
          </div>
          <div>
            <label htmlFor="fod-category" className={lbl}>Food Category</label>
            <input id="fod-category" name="foodCategory" autoComplete="off" {...register('foodCategory')} className={inp} />
          </div>
        </div>
        <div>
          <label htmlFor="fod-timing" className={lbl}>Timing</label>
          <input id="fod-timing" name="timing" autoComplete="off" {...register('timing')} placeholder="7:00 AM – 10:00 PM" className={inp} />
        </div>
        <div>
          <label htmlFor="fod-phone" className={lbl}>Phone</label>
          <input id="fod-phone" name="phone" autoComplete="tel" {...register('phone')} className={inp} />
        </div>
      </div>

      {/* ── Varieties ── */}
      <div className={section}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Varieties</h3>
            <p className="text-xs text-slate-400 mt-0.5">No limit. Toggle "Popular" to feature on user side (max {MAX_POPULAR} shown).</p>
          </div>
          <button
            type="button"
            onClick={() => appendVariety({ name: '', popular: false, totalRestaurants: '', restaurants: [{ name: '', orderLink: '' }, { name: '', orderLink: '' }] })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Variety
          </button>
        </div>

        {varietyFields.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No varieties added yet.</p>
        )}

        {varietyFields.map((field, idx) => (
          <div key={field.id} className="rounded-xl p-4 space-y-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className={lbl} htmlFor={`variety-name-${idx}`}>Variety Name *</label>
                <input id={`variety-name-${idx}`} {...register(`varieties.${idx}.name`, { required: 'Required' })} className={inp} placeholder="e.g. Biryani" />
              </div>
              <div className="shrink-0 pt-5">
                <button type="button" onClick={() => removeVariety(idx)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl} htmlFor={`variety-totalr-${idx}`}>Total Restaurants</label>
                <input id={`variety-totalr-${idx}`} {...register(`varieties.${idx}.totalRestaurants`)} type="number" min="0" placeholder="e.g. 12" className={inp} />
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    id={`variety-popular-${idx}`}
                    checked={!!watchedVarieties?.[idx]?.popular}
                    onChange={(val) => setValue(`varieties.${idx}.popular`, val, { shouldDirty: true })}
                  />
                  <label htmlFor={`variety-popular-${idx}`} className="text-sm text-slate-700 flex items-center gap-1 cursor-pointer">
                    <Star className="w-3.5 h-3.5 text-amber-400" /> Popular
                    <span className="text-xs text-slate-400">(max {MAX_POPULAR})</span>
                  </label>
                </div>
              </div>
            </div>

            <RestaurantPair register={register} prefix={`varieties.${idx}.restaurants.0`} label="Top Restaurant #1" />
            <RestaurantPair register={register} prefix={`varieties.${idx}.restaurants.1`} label="Top Restaurant #2" />
          </div>
        ))}
      </div>

      {/* ── Sweets ── */}
      <div className={section}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Sweets</h3>
            <p className="text-xs text-slate-400 mt-0.5">Max {MAX_SWEETS} sweets. Each with top 2 restaurants.</p>
          </div>
          <button
            type="button"
            disabled={sweetFields.length >= MAX_SWEETS}
            onClick={() => appendSweet({ name: '', restaurants: [{ name: '', orderLink: '' }, { name: '', orderLink: '' }] })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Sweet
          </button>
        </div>
        <p className="text-xs text-slate-400 -mt-2">{sweetFields.length}/{MAX_SWEETS} sweets</p>

        {sweetFields.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No sweets added yet.</p>
        )}

        {sweetFields.map((field, idx) => (
          <div key={field.id} className="rounded-xl p-4 space-y-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className={lbl} htmlFor={`sweet-name-${idx}`}>Sweet Name *</label>
                <input id={`sweet-name-${idx}`} {...register(`sweets.${idx}.name`, { required: 'Required' })} className={inp} placeholder="e.g. Pootharekulu" />
              </div>
              <div className="shrink-0 pt-5">
                <button type="button" onClick={() => removeSweet(idx)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <RestaurantPair register={register} prefix={`sweets.${idx}.restaurants.0`} label="Top Restaurant #1" />
            <RestaurantPair register={register} prefix={`sweets.${idx}.restaurants.1`} label="Top Restaurant #2" />
          </div>
        ))}
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location & Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="food-scope" className={lbl}>Scope *</label>
            <select id="food-scope" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={inp}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="food-city" className={lbl}>City</label>
            <input id="food-city" name="city" autoComplete="address-level2"
              {...register('city')} className={inp} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="food-location" className={lbl}>Location</label>
            <input id="food-location" name="location" autoComplete="off"
              {...register('location')} className={inp} />
          </div>
          <div>
            <label htmlFor="food-region" className={lbl}>Region</label>
            <input id="food-region" name="region" autoComplete="off"
              {...register('region')} className={inp} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
