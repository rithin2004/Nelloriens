import { useState } from 'react'
import { useForm } from 'react-hook-form'
import ImageUpload from '../common/ImageUpload'
import MapPicker from '../common/MapPicker'

const field = 'block text-sm font-medium text-slate-700 mb-1'
const input = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

const AMENITIES = ['WiFi', 'AC', 'Parking', 'Pool', 'Restaurant', 'Gym']

export default function StayForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ defaultValues })
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  const [location, setLocation] = useState({ lat: defaultValues?.latitude, lng: defaultValues?.longitude })

  const handleMapChange = ({ lat, lng }) => {
    setLocation({ lat, lng })
    setValue('latitude', lat)
    setValue('longitude', lng)
  }

  const submit = (data) => {
    onSubmit({ ...data, thumbnail, latitude: location.lat, longitude: location.lng })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        <h3 className="font-semibold text-slate-800">Hotel Details</h3>
        <div><label className={field}>Hotel Name *</label><input {...register('hotelName', { required: 'Required' })} className={input} /></div>
        <ImageUpload module="stays" label="Thumbnail *" value={thumbnail} onChange={setThumbnail} />
        <div><label className={field}>Description *</label><textarea {...register('description', { required: 'Required' })} rows={3} className={input} /></div>
        <div><label className={field}>Address *</label><input {...register('address', { required: 'Required' })} className={input} /></div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location</h3>
        <MapPicker lat={location.lat} lng={location.lng} onChange={handleMapChange} />
        <div className="grid grid-cols-2 gap-4">
          <div><label className={field}>Latitude *</label><input {...register('latitude', { required: 'Required' })} type="number" step="any" className={input} readOnly /></div>
          <div><label className={field}>Longitude *</label><input {...register('longitude', { required: 'Required' })} type="number" step="any" className={input} readOnly /></div>
        </div>
        <div><label className={field}>Google Maps URL</label><input {...register('googleMapsUrl')} type="url" className={input} /></div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">More Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={field}>Star Rating</label>
            <select {...register('starRating')} className={input}>
              <option value="">Select</option>
              {[1,2,3,4,5].map((s) => <option key={s} value={s}>{s} Star</option>)}
            </select>
          </div>
          <div><label className={field}>Price Per Night</label><input {...register('pricePerNight')} className={input} placeholder="₹1,200 onwards" /></div>
        </div>
        <div><label className={field}>Phone</label><input {...register('phone')} className={input} /></div>
        <div><label className={field}>Website URL</label><input {...register('websiteUrl')} type="url" className={input} /></div>
        <div><label className={field}>Booking URL</label><input {...register('bookingUrl')} type="url" className={input} placeholder="OYO/MakeMyTrip" /></div>
        <div>
          <label className={field}>Amenities</label>
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

      <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
