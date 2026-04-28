import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import ImageUpload from '../common/ImageUpload'
import MapPicker from '../common/MapPicker'
import InlineCategoryAdd from '../common/InlineCategoryAdd'
import { staysApi } from '../../services/api'

const field = 'block text-sm font-medium text-slate-700 mb-1'

function ToggleSwitch({ id, checked, onChange, label, hint }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <button type="button" role="switch" aria-checked={checked} id={id}
        onClick={() => onChange(!checked)}
        className="relative inline-flex items-center rounded-full transition-colors w-10 h-6 shrink-0"
        style={{ background: checked ? '#10B981' : '#D1D5DB' }}>
        <span className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  )
}
const input = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

const AMENITIES = ['WiFi', 'AC', 'Parking', 'Pool', 'Restaurant', 'Gym']

export default function StayForm({ defaultValues, onSubmit, loading, contentId, onDirtyChange }) {
  const { register, handleSubmit, setValue, formState: { isDirty } } = useForm({ defaultValues })
  const [isTop,      setIsTop]      = useState(defaultValues?.isTop      || false)
  const [isVerified, setIsVerified] = useState(defaultValues?.isVerified || false)
  const [thumbnail,  setThumbnail]  = useState(defaultValues?.thumbnail || '')
  const [categories, setCategories] = useState([])
  const [locations,  setLocations]  = useState([])
  const [location,   setLocation]   = useState({ lat: defaultValues?.latitude, lng: defaultValues?.longitude })

  const fetchCategories = () => staysApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
  const fetchLocations  = () => staysApi.getLocations().then((r)  => setLocations(r.data.data  || [])).catch(() => {})

  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])
  useEffect(() => { fetchCategories(); fetchLocations() }, [])

  const handleMapChange = ({ lat, lng }) => {
    setLocation({ lat, lng })
    setValue('latitude', lat)
    setValue('longitude', lng)
  }

  const submit = (data) => {
    onSubmit({ ...data, thumbnail, isTop, isVerified, latitude: location.lat, longitude: location.lng })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        {/* RULE 13/30 — isTop toggle at top right, visual switch */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Hotel Details</h3>
          <div className="flex items-center gap-3">
            <ToggleSwitch id="sty-top" checked={isTop} onChange={setIsTop}
              label="Top Stay" hint="(max 3/category)" />
            <ToggleSwitch id="sty-verified" checked={isVerified} onChange={setIsVerified} label="Verified" />
          </div>
        </div>
        <div>
          <label htmlFor="sty-name" className={field}>Hotel / Stay Name *</label>
          <input id="sty-name" name="title" autoComplete="organization" {...register('title', { required: 'Required' })} className={input} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="sty-category" className={field} style={{ marginBottom: 0 }}>Category</label>
              <InlineCategoryAdd label="Category" placeholder="e.g. Budget"
                onAdd={async (name) => { await staysApi.createCategory({ name }); await fetchCategories() }} />
            </div>
            <select id="sty-category" name="category" autoComplete="off" {...register('category')} className={input}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="sty-location" className={field} style={{ marginBottom: 0 }}>Location</label>
              <InlineCategoryAdd label="Location" placeholder="e.g. City Centre"
                onAdd={async (name) => { await staysApi.createLocation({ name }); await fetchLocations() }} />
            </div>
            <select id="sty-location" name="stayLocation" autoComplete="off" {...register('stayLocation')} className={input}>
              <option value="">Select location</option>
              {locations.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          </div>
        </div>
        <ImageUpload module="stays" label="Thumbnail *" value={thumbnail} onChange={setThumbnail} contentId={contentId} section="thumbnails" />
        <div>
          <label htmlFor="sty-desc" className={field}>Description *</label>
          <textarea id="sty-desc" name="description" autoComplete="off" {...register('description', { required: 'Required' })} rows={3} className={input} />
        </div>
        <div>
          <label htmlFor="sty-address" className={field}>Address *</label>
          <input id="sty-address" name="address" autoComplete="street-address" {...register('address', { required: 'Required' })} className={input} />
        </div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location</h3>
        <MapPicker lat={location.lat} lng={location.lng} onChange={handleMapChange} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="sty-lat" className={field}>Latitude *</label>
            <input id="sty-lat" name="latitude" autoComplete="off" {...register('latitude', { required: 'Required' })} type="number" step="any" className={input} readOnly />
          </div>
          <div>
            <label htmlFor="sty-lng" className={field}>Longitude *</label>
            <input id="sty-lng" name="longitude" autoComplete="off" {...register('longitude', { required: 'Required' })} type="number" step="any" className={input} readOnly />
          </div>
        </div>
        <div>
          <label htmlFor="sty-mapsurl" className={field}>Google Maps URL</label>
          <input id="sty-mapsurl" name="googleMapsUrl" type="url" autoComplete="url" {...register('googleMapsUrl')} className={input} />
        </div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">More Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="sty-stars" className={field}>Star Rating</label>
            <select id="sty-stars" name="starRating" autoComplete="off" {...register('starRating')} className={input}>
              <option value="">Select</option>
              {[1,2,3,4,5].map((s) => <option key={s} value={s}>{s} Star</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sty-price" className={field}>Price Per Night *</label>
            <input id="sty-price" name="pricePerNight" autoComplete="off" {...register('pricePerNight', { required: 'Required' })} className={input} placeholder="₹1,200 onwards" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sty-checkin" className={field}>Check-in Time</label>
            <input id="sty-checkin" name="checkInTime" autoComplete="off" {...register('checkInTime')} className={input} placeholder="e.g. 12:00 PM" />
          </div>
          <div>
            <label htmlFor="sty-checkout" className={field}>Check-out Time</label>
            <input id="sty-checkout" name="checkOutTime" autoComplete="off" {...register('checkOutTime')} className={input} placeholder="e.g. 11:00 AM" />
          </div>
        </div>
        <div>
          <label htmlFor="sty-phone" className={field}>Phone *</label>
          <input id="sty-phone" name="phone" type="tel" autoComplete="tel" {...register('phone', { required: 'Required' })} className={input} />
        </div>
        <div>
          <label htmlFor="sty-website" className={field}>Website URL</label>
          <input id="sty-website" name="websiteUrl" type="url" autoComplete="url" {...register('websiteUrl')} className={input} />
        </div>
        <div>
          <label htmlFor="sty-booking" className={field}>Booking URL</label>
          <input id="sty-booking" name="bookingUrl" type="url" autoComplete="url" {...register('bookingUrl')} className={input} placeholder="Generic booking link" />
        </div>
        <div>
          <p className={field}>Amenities</p>
          <div className="flex flex-wrap gap-3 mt-1">
            {AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700">
                <input type="checkbox" value={a} {...register('amenities')} className="w-4 h-4 accent-purple-600" />
                {a}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location & Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="stay-scope" className={field}>Scope *</label>
            <select id="stay-scope" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={input}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="stay-region" className={field}>Region</label>
            <input id="stay-region" name="region" autoComplete="off"
              {...register('region')} className={input} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
