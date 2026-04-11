import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import RichTextEditor from '../common/RichTextEditor'
import ImageUpload from '../common/ImageUpload'
import MapPicker from '../common/MapPicker'
import { transportApi } from '../../services/api'

const field = 'block text-sm font-medium text-slate-700 mb-1'
const input = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

// Fields shown per category type (matched by name, case-insensitive)
function getType(categoryName = '') {
  const n = categoryName.toLowerCase()
  if (n.includes('train')) return 'train'
  if (n.includes('bus'))   return 'bus'
  if (n.includes('air'))   return 'airport'
  return 'general'
}

export default function TransportForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, setValue, watch } = useForm({ defaultValues })
  const [categories, setCategories]   = useState([])
  const [description, setDescription] = useState(defaultValues?.description || '')
  const [routesInfo, setRoutesInfo]   = useState(defaultValues?.routesInfo || '')
  const [thumbnail, setThumbnail]     = useState(defaultValues?.thumbnail || '')
  const [location, setLocation]       = useState({ lat: defaultValues?.latitude, lng: defaultValues?.longitude })

  useEffect(() => {
    transportApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  }, [])

  const selectedCatId = watch('category')
  const selectedCat   = categories.find((c) => c._id === selectedCatId)
  const catType       = getType(selectedCat?.name)

  const submit = (data) => {
    onSubmit({ ...data, description, routesInfo, thumbnail, latitude: location.lat, longitude: location.lng })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">

      {/* Step 1 — Category (required first) */}
      <div className={section}>
        <h3 className="font-semibold text-slate-800">Step 1 — Select Category</h3>
        <div>
          <label className={field}>Transport Category *</label>
          {categories.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No categories yet. <a href="/transport/categories" className="text-sky-600 hover:underline">Add categories</a> (Train, Bus, Airport) first.</p>
          ) : (
            <select {...register('category', { required: 'Please select a category' })} className={input}>
              <option value="">Select category…</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Step 2 — Details (shown only when category selected) */}
      {selectedCatId && (
        <>
          <div className={section}>
            <h3 className="font-semibold text-slate-800">
              {catType === 'train'   && '🚂 Train Details'}
              {catType === 'bus'     && '🚌 Bus Details'}
              {catType === 'airport' && '✈️ Airport Details'}
              {catType === 'general' && 'Transport Details'}
            </h3>

            <div>
              <label className={field}>
                {catType === 'train'   && 'Train / Station Name *'}
                {catType === 'bus'     && 'Bus Service Name *'}
                {catType === 'airport' && 'Airport / Terminal Name *'}
                {catType === 'general' && 'Transport Name *'}
              </label>
              <input {...register('name', { required: true })} className={input}
                placeholder={
                  catType === 'train'   ? 'e.g. Nellore Railway Station' :
                  catType === 'bus'     ? 'e.g. APSRTC Nellore Depot' :
                  catType === 'airport' ? 'e.g. Nellore Airport' :
                  'e.g. Transport name'
                }
              />
            </div>

            {/* Train-specific */}
            {catType === 'train' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={field}>Train Number</label><input {...register('trainNumber')} className={input} placeholder="e.g. 12759" /></div>
                  <div><label className={field}>Train Name</label><input {...register('trainName')} className={input} placeholder="e.g. Charminar Express" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={field}>Departure Station</label><input {...register('departureStation')} className={input} placeholder="e.g. Nellore" /></div>
                  <div><label className={field}>Arrival Station</label><input {...register('arrivalStation')} className={input} placeholder="e.g. Chennai" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={field}>Departure Time</label><input {...register('departureTime')} className={input} placeholder="e.g. 06:30 AM" /></div>
                  <div><label className={field}>Arrival Time</label><input {...register('arrivalTime')} className={input} placeholder="e.g. 10:45 AM" /></div>
                </div>
                <div><label className={field}>Running Days</label><input {...register('runningDays')} className={input} placeholder="e.g. Mon, Wed, Fri, Sun" /></div>
                <div><label className={field}>Classes Available</label><input {...register('classes')} className={input} placeholder="e.g. 1A, 2A, 3A, SL, GN" /></div>
                <div><label className={field}>IRCTC Booking URL</label><input {...register('bookingUrl')} type="url" className={input} placeholder="https://irctc.co.in/…" /></div>
              </>
            )}

            {/* Bus-specific */}
            {catType === 'bus' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={field}>Route / Bus Number</label><input {...register('routeNumber')} className={input} placeholder="e.g. Route 99" /></div>
                  <div><label className={field}>Operator</label><input {...register('operator')} className={input} placeholder="e.g. APSRTC" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={field}>From</label><input {...register('fromLocation')} className={input} placeholder="e.g. Nellore" /></div>
                  <div><label className={field}>To</label><input {...register('toLocation')} className={input} placeholder="e.g. Hyderabad" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={field}>First Bus</label><input {...register('firstBus')} className={input} placeholder="e.g. 05:00 AM" /></div>
                  <div><label className={field}>Last Bus</label><input {...register('lastBus')} className={input} placeholder="e.g. 11:00 PM" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={field}>Frequency</label><input {...register('frequency')} className={input} placeholder="e.g. Every 30 mins" /></div>
                  <div><label className={field}>Fare (approx)</label><input {...register('fare')} className={input} placeholder="e.g. ₹250" /></div>
                </div>
                <div><label className={field}>Bus Type</label>
                  <select {...register('busType')} className={input}>
                    <option value="">Select</option>
                    {['Ordinary', 'Express', 'Deluxe', 'AC Sleeper', 'Volvo', 'Mini Bus'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className={field}>Online Booking URL</label><input {...register('bookingUrl')} type="url" className={input} placeholder="https://apsrtconline.in/…" /></div>
              </>
            )}

            {/* Airport-specific */}
            {catType === 'airport' && (
              <>
                <div><label className={field}>IATA Code</label><input {...register('iataCode')} className={input} placeholder="e.g. VGA" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={field}>Terminal(s)</label><input {...register('terminals')} className={input} placeholder="e.g. Terminal 1, Terminal 2" /></div>
                  <div><label className={field}>Airlines Operating</label><input {...register('airlines')} className={input} placeholder="e.g. IndiGo, Air India" /></div>
                </div>
                <div><label className={field}>Flight Booking URL</label><input {...register('bookingUrl')} type="url" className={input} placeholder="https://www.makemytrip.com/…" /></div>
                <div><label className={field}>Airport Website</label><input {...register('websiteUrl')} type="url" className={input} placeholder="https://…" /></div>
              </>
            )}

            {/* General */}
            {catType === 'general' && (
              <>
                <div><label className={field}>Website URL</label><input {...register('websiteUrl')} type="url" className={input} /></div>
                <div><label className={field}>App / Booking URL</label><input {...register('appRedirectUrl')} type="url" className={input} placeholder="Rapido, Ola, IRCTC…" /></div>
              </>
            )}

            {/* Common to all */}
            <div><label className={field}>Contact Phone</label><input {...register('contactPhone')} className={input} /></div>
            <div><label className={field}>Description</label><RichTextEditor value={description} onChange={setDescription} /></div>
            <ImageUpload module="transport" label="Thumbnail" value={thumbnail} onChange={setThumbnail} />
          </div>

          {/* Route & Fare — shown for train/bus */}
          {(catType === 'train' || catType === 'bus') && (
            <div className={section}>
              <h3 className="font-semibold text-slate-800">Route & Fare Info</h3>
              <div><label className={field}>Routes Info</label><RichTextEditor value={routesInfo} onChange={setRoutesInfo} /></div>
              <div><label className={field}>Fare Details</label><textarea {...register('fareInfo')} rows={3} className={input} placeholder="e.g. SL ₹180, 3A ₹450…" /></div>
            </div>
          )}

          {/* Location */}
          <div className={section}>
            <h3 className="font-semibold text-slate-800">
              {catType === 'train' ? 'Station Location' : catType === 'bus' ? 'Bus Stand Location' : catType === 'airport' ? 'Airport Location' : 'Location'}
            </h3>
            <MapPicker lat={location.lat} lng={location.lng} onChange={(ll) => setLocation(ll)} />
            <div><label className={field}>Address</label><input {...register('address')} className={input} /></div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </>
      )}
    </form>
  )
}
