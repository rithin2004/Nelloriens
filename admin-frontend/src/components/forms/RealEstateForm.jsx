import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Upload, Loader } from 'lucide-react'
import ImageUpload from '../common/ImageUpload'
import MapPicker from '../common/MapPicker'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { realEstateApi, uploadApi } from '../../services/api'
import toast from 'react-hot-toast'

const field   = 'block text-sm font-medium text-slate-700 mb-1'
const input   = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

function ToggleSwitch({ id, checked, onChange, label }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-semibold text-slate-500">{label}</span>}
      <button type="button" role="switch" aria-checked={checked} id={id}
        onClick={() => onChange(!checked)}
        className="relative inline-flex items-center rounded-full transition-colors w-10 h-6 shrink-0"
        style={{ background: checked ? '#10B981' : '#D1D5DB' }}>
        <span className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
    </div>
  )
}

const MAX_PHOTOS = 6

const FALLBACK_TYPES = ['Plot', 'Flat', 'House', 'Villa']

export default function RealEstateForm({ defaultValues, onSubmit, loading, contentId, onDirtyChange }) {
  const { register, handleSubmit, setValue, formState: { errors, isDirty } } = useForm({ defaultValues })
  const [isVerified,    setIsVerified]    = useState(defaultValues?.isVerified || false)
  const [locations,     setLocations]     = useState([])
  const [propertyTypes, setPropertyTypes] = useState([])
  const [amenities,     setAmenities]     = useState([])
  const [thumbnail,     setThumbnail]     = useState(defaultValues?.thumbnail || '')
  const [photos,        setPhotos]        = useState(defaultValues?.photos    || [])
  const [photoUploading, setPhotoUploading] = useState(false)
  const [location,      setLocation]      = useState({ lat: defaultValues?.latitude, lng: defaultValues?.longitude })
  const [possessionDate, setPossessionDate] = useState(defaultValues?.possessionDate ? new Date(defaultValues.possessionDate) : null)
  const photoInputRef = useRef(null)

  const isSale = (defaultValues?.section || 'sale') === 'sale'

  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])

  useEffect(() => {
    realEstateApi.getLocations().then((r)  => setLocations(r.data.data     || [])).catch(() => {})
    realEstateApi.getTypes().then((r)      => setPropertyTypes(r.data.data || [])).catch(() => {})
    realEstateApi.getAmenities().then((r)  => setAmenities(r.data.data     || [])).catch(() => {})
  }, [])

  const handleMapChange = ({ lat, lng }) => {
    setLocation({ lat, lng })
    setValue('latitude', lat)
    setValue('longitude', lng)
  }

  const handlePhotoFile = async (e) => {
    const file = e.target.files[0]
    if (!file || photos.length >= MAX_PHOTOS) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5 MB'); return }
    const fd = new FormData()
    fd.append('file', file)
    if (contentId) fd.append('contentId', contentId)
    fd.append('section', 'photos')
    fd.append('index', String(photos.length + 1))
    setPhotoUploading(true)
    try {
      const r = await uploadApi.upload('realestate', fd)
      setPhotos((prev) => [...prev, r.data.data.url])
    } catch { toast.error('Photo upload failed') }
    finally { setPhotoUploading(false); e.target.value = '' }
  }

  const removePhoto = async (idx) => {
    const url = photos[idx]
    if (url) { try { await uploadApi.delete(url) } catch { /* ignore storage delete errors */ } }
    setPhotos((prev) => prev.filter((_, i) => i !== idx))
  }


  const submit = (data) => {
    onSubmit({ ...data, thumbnail, photos, isVerified, latitude: location.lat, longitude: location.lng, possessionDate: possessionDate?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Listing Details</h3>
          <ToggleSwitch id="res-verified" checked={isVerified} onChange={setIsVerified} label="Verified" />
        </div>
        <div>
          <label htmlFor="res-title" className={field}>Title *</label>
          <input id="res-title" name="title" autoComplete="off"
            {...register('title', { required: 'Required' })} className={input} />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="res-type" className={field}>Type *</label>
            <select id="res-type" name="type" autoComplete="off" {...register('type', { required: 'Required' })} className={input}>
              <option value="">Select type</option>
              {(propertyTypes.length > 0 ? propertyTypes.map((t) => t.name) : FALLBACK_TYPES).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type.message}</p>}
          </div>
          <div>
            <label htmlFor="res-location" className={field}>Location</label>
            <select id="res-location" name="location" autoComplete="off" {...register('location')} className={input}>
              <option value="">Select location</option>
              {locations.map((l) => <option key={l._id} value={l.name}>{l.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="res-sqft" className={field}>Area (sqft)</label>
            <input id="res-sqft" name="sqft" type="number" min="0" autoComplete="off"
              {...register('sqft')} className={input} placeholder="e.g. 1200" />
          </div>
          <div>
            <label htmlFor="res-bhk" className={field}>BHK</label>
            <input id="res-bhk" name="bhk" type="number" min="0" autoComplete="off"
              {...register('bhk')} className={input} placeholder="e.g. 3" />
          </div>
        </div>
        {isSale ? (
          <div>
            <label htmlFor="res-price" className={field}>Price (₹) *</label>
            <input id="res-price" name="price" autoComplete="off"
              {...register('price', { required: 'Required' })} className={input} placeholder="e.g. 45,00,000" />
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
          </div>
        ) : (
          <div>
            <label htmlFor="res-rent" className={field}>Monthly Rent (₹) *</label>
            <input id="res-rent" name="monthlyRent" autoComplete="off"
              {...register('monthlyRent', { required: 'Required' })} className={input} placeholder="e.g. 12,000/month" />
            {errors.monthlyRent && <p className="text-xs text-red-600 mt-1">{errors.monthlyRent.message}</p>}
          </div>
        )}
        <div>
          <label htmlFor="res-desc" className={field}>Description *</label>
          <textarea id="res-desc" name="description" autoComplete="off"
            {...register('description', { required: 'Required' })} rows={3} className={input} />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="res-facing" className={field}>Facing</label>
            <select id="res-facing" name="facing" autoComplete="off" {...register('facing')} className={input}>
              <option value="">Select</option>
              {['North','South','East','West','Northeast','Northwest','Southeast','Southwest'].map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="res-furnishing" className={field}>Furnishing</label>
            <select id="res-furnishing" name="furnishing" autoComplete="off" {...register('furnishing')} className={input}>
              <option value="">Select</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi_furnished">Semi-Furnished</option>
              <option value="fully_furnished">Fully Furnished</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="res-floor" className={field}>Floor</label>
            <input id="res-floor" name="floor" type="number" min="0" autoComplete="off" {...register('floor')} className={input} placeholder="e.g. 3" />
          </div>
          <div>
            <label htmlFor="res-totalfloors" className={field}>Total Floors</label>
            <input id="res-totalfloors" name="totalFloors" type="number" min="0" autoComplete="off" {...register('totalFloors')} className={input} placeholder="e.g. 10" />
          </div>
          <div>
            <label htmlFor="res-age" className={field}>Age of Property</label>
            <input id="res-age" name="ageOfProperty" autoComplete="off" {...register('ageOfProperty')} className={input} placeholder="e.g. 5 years" />
          </div>
        </div>

        <div>
          <label htmlFor="res-possession" className={field}>Possession Date</label>
          <DatePicker id="res-possession" selected={possessionDate} onChange={setPossessionDate}
            dateFormat="dd/MM/yyyy" className="w-full" isClearable placeholderText="Select date" />
        </div>

        {amenities.length > 0 && (
          <div>
            <p className={field}>Amenities</p>
            <div className="flex flex-wrap gap-3 mt-1">
              {amenities.map((a) => (
                <label key={a._id} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700">
                  <input type="checkbox" id={`res-amenity-${a._id}`} value={a._id} {...register('amenities')} className="w-4 h-4 accent-purple-600" />
                  {a.name}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Media</h3>
        <ImageUpload
          module="realestate" label="Thumbnail *"
          value={thumbnail} onChange={setThumbnail}
          contentId={contentId} section="thumbnails"
        />
        <div>
          <p className={field}>Photos (max {MAX_PHOTOS})</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {photos.map((url, idx) => (
              <div key={idx} className="relative w-20 h-16">
                <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                <button type="button" onClick={() => removePhoto(idx)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs leading-none">
                  ×
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button type="button" onClick={() => photoInputRef.current?.click()}
                disabled={photoUploading}
                className="w-20 h-16 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-purple-400 hover:text-purple-500 transition-colors text-xs gap-1 disabled:opacity-50">
                {photoUploading
                  ? <Loader className="w-4 h-4 animate-spin" />
                  : <><Upload className="w-4 h-4" /><span>Add</span></>
                }
              </button>
            )}
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
            onChange={handlePhotoFile} />
        </div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Map Location</h3>
        <MapPicker lat={location.lat} lng={location.lng} onChange={handleMapChange} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="res-lat" className={field}>Latitude</label>
            <input id="res-lat" name="latitude" autoComplete="off"
              {...register('latitude')} type="number" step="any" className={input} readOnly />
          </div>
          <div>
            <label htmlFor="res-lng" className={field}>Longitude</label>
            <input id="res-lng" name="longitude" autoComplete="off"
              {...register('longitude')} type="number" step="any" className={input} readOnly />
          </div>
        </div>
        <div>
          <label htmlFor="res-maps" className={field}>Google Maps URL</label>
          <input id="res-maps" name="googleMapsUrl" type="url" autoComplete="url"
            {...register('googleMapsUrl')} className={input} />
        </div>
        <div>
          <label htmlFor="res-address" className={field}>Address</label>
          <input id="res-address" name="address" autoComplete="street-address"
            {...register('address')} className={input} />
        </div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Contact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="res-phone" className={field}>Phone</label>
            <input id="res-phone" name="phone" type="tel" autoComplete="tel"
              {...register('phone')} className={input} />
          </div>
          <div>
            <label htmlFor="res-contact-name" className={field}>Contact Name</label>
            <input id="res-contact-name" name="contactName" autoComplete="name"
              {...register('contactName')} className={input} />
          </div>
        </div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location & Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="res-scope" className={field}>Scope *</label>
            <select id="res-scope" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={input}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="res-city" className={field}>City</label>
            <input id="res-city" name="city" autoComplete="address-level2"
              {...register('city')} className={input} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="res-loc-text" className={field}>Area / Locality</label>
            <input id="res-loc-text" name="area" autoComplete="off"
              {...register('area')} className={input} />
          </div>
          <div>
            <label htmlFor="res-region" className={field}>Region</label>
            <input id="res-region" name="region" autoComplete="off"
              {...register('region')} className={input} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
