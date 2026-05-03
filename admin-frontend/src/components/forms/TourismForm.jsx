import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import RichTextEditor from '../common/RichTextEditor'
import ImageUpload from '../common/ImageUpload'
import InlineCategoryAdd from '../common/InlineCategoryAdd'
import MapPicker from '../common/MapPicker'
import { tourismApi } from '../../services/api'

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

export default function TourismForm({ defaultValues, onSubmit, loading, contentId }) {
  const { register, handleSubmit, setValue } = useForm({ defaultValues })
  const [locations, setLocations] = useState([])
  const [categories, setCategories] = useState([])
  const [isPopular,  setIsPopular]  = useState(defaultValues?.isPopular  || false)
  const [isVerified, setIsVerified] = useState(defaultValues?.isVerified || false)
  const [description, setDescription] = useState(defaultValues?.description || '')
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  const [location, setLocation] = useState({ lat: defaultValues?.latitude, lng: defaultValues?.longitude })

  const fetchCategories = () => tourismApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
  const fetchLocations  = () => tourismApi.getLocations().then((r)  => setLocations(r.data.data  || [])).catch(() => {})

  useEffect(() => {
    fetchCategories()
    fetchLocations()
  }, [])

  const handleMapChange = ({ lat, lng }) => {
    setLocation({ lat, lng })
    setValue('latitude', lat)
    setValue('longitude', lng)
  }

  const submit = (data) => {
    onSubmit({ ...data, description, thumbnail, isPopular, isVerified, latitude: location.lat, longitude: location.lng })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        {/* RULE 13 — isPopular toggle at top right, visual switch */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Place Details</h3>
          <div className="flex items-center gap-3">
            <ToggleSwitch id="tur-popular" checked={isPopular} onChange={setIsPopular}
              label="Popular" hint="(max 10 globally)" />
            <ToggleSwitch id="tur-verified" checked={isVerified} onChange={setIsVerified} label="Verified" />
          </div>
        </div>
        <div>
          <label htmlFor="tur-name" className={field}>Place Name *</label>
          <input id="tur-name" name="placeName" autoComplete="off" {...register('placeName', { required: true })} className={input} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label htmlFor="tur-category" className={field} style={{ marginBottom: 0 }}>Category *</label>
            <InlineCategoryAdd
              label="Category"
              placeholder="e.g. Heritage"
              onAdd={async (name) => {
                await tourismApi.createCategory({ name })
                await fetchCategories()
              }}
            />
          </div>
          <select id="tur-category" name="category" autoComplete="off" {...register('category', { required: true })} className={input}>
            <option value="">Select</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div><p className={field}>Description *</p><RichTextEditor value={description} onChange={setDescription} /></div>
        <ImageUpload module="tourism" label="Thumbnail *" value={thumbnail} onChange={setThumbnail} contentId={contentId} section="thumbnails" />
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location *</h3>
        <MapPicker lat={location.lat} lng={location.lng} onChange={handleMapChange} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tur-lat" className={field}>Latitude</label>
            <input id="tur-lat" name="latitude" autoComplete="off" {...register('latitude')} type="number" step="any" className={input} readOnly />
          </div>
          <div>
            <label htmlFor="tur-lng" className={field}>Longitude</label>
            <input id="tur-lng" name="longitude" autoComplete="off" {...register('longitude')} type="number" step="any" className={input} readOnly />
          </div>
        </div>
        <div>
          <label htmlFor="tur-address" className={field}>Address</label>
          <input id="tur-address" name="address" autoComplete="street-address" {...register('address')} className={input} />
        </div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Visit Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tur-fee" className={field}>Entry Fee</label>
            <input id="tur-fee" name="entryFee" autoComplete="off" {...register('entryFee')} className={input} placeholder="₹30 or Free" />
          </div>
          <div>
            <label htmlFor="tur-timings" className={field}>Timings</label>
            <input id="tur-timings" name="timings" autoComplete="off" {...register('timings')} className={input} placeholder="6:00 AM – 6:00 PM" />
          </div>
        </div>
        <div>
          <label htmlFor="tur-besttime" className={field}>Best Time to Visit</label>
          <input id="tur-besttime" name="bestTime" autoComplete="off" {...register('bestTime')} className={input} placeholder="October to February" />
        </div>
        <div>
          <label htmlFor="tur-mapsurl" className={field}>Google Maps URL</label>
          <input id="tur-mapsurl" name="googleMapsUrl" type="url" autoComplete="url" {...register('googleMapsUrl')} className={input} />
        </div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location & Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tourism-scope" className={field}>Scope *</label>
            <select id="tourism-scope" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={input}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="tourism-city" className={field}>City</label>
            <input id="tourism-city" name="city" autoComplete="address-level2"
              {...register('city')} className={input} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="tourism-location" className={field} style={{ marginBottom: 0 }}>Location</label>
              <InlineCategoryAdd
                label="Location"
                placeholder="e.g. Mypadu"
                onAdd={async (name) => {
                  await tourismApi.createLocation({ name })
                  await fetchLocations()
                }}
              />
            </div>
            <select id="tourism-location" name="location" autoComplete="off" {...register('location')} className={input}>
              <option value="">Select location</option>
              {locations.map((l) => <option key={l._id} value={l.name}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tourism-region" className={field}>Region</label>
            <input id="tourism-region" name="region" autoComplete="off"
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
