import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import RichTextEditor from '../common/RichTextEditor'
import ImageUpload from '../common/ImageUpload'
import MapPicker from '../common/MapPicker'
import { tourismApi } from '../../services/api'

const field = 'block text-sm font-medium text-slate-700 mb-1'
const input = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

export default function TourismForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, setValue } = useForm({ defaultValues })
  const [categories, setCategories] = useState([])
  const [description, setDescription] = useState(defaultValues?.description || '')
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  const [location, setLocation] = useState({ lat: defaultValues?.latitude, lng: defaultValues?.longitude })

  useEffect(() => {
    tourismApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  }, [])

  const handleMapChange = ({ lat, lng }) => {
    setLocation({ lat, lng })
    setValue('latitude', lat)
    setValue('longitude', lng)
  }

  const submit = (data) => {
    onSubmit({ ...data, description, thumbnail, latitude: location.lat, longitude: location.lng })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        <h3 className="font-semibold text-slate-800">Place Details</h3>
        <div><label className={field}>Place Name *</label><input {...register('placeName', { required: true })} className={input} /></div>
        <div>
          <label className={field}>Category *</label>
          <select {...register('category', { required: true })} className={input}>
            <option value="">Select</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className={field}>Description *</label><RichTextEditor value={description} onChange={setDescription} /></div>
        <ImageUpload module="tourism" label="Thumbnail *" value={thumbnail} onChange={setThumbnail} />
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location *</h3>
        <MapPicker lat={location.lat} lng={location.lng} onChange={handleMapChange} />
        <div className="grid grid-cols-2 gap-4">
          <div><label className={field}>Latitude</label><input {...register('latitude')} type="number" step="any" className={input} readOnly /></div>
          <div><label className={field}>Longitude</label><input {...register('longitude')} type="number" step="any" className={input} readOnly /></div>
        </div>
        <div><label className={field}>Address</label><input {...register('address')} className={input} /></div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Visit Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={field}>Entry Fee</label><input {...register('entryFee')} className={input} placeholder="₹30 or Free" /></div>
          <div><label className={field}>Timings</label><input {...register('timings')} className={input} placeholder="6:00 AM – 6:00 PM" /></div>
        </div>
        <div><label className={field}>Best Time to Visit</label><input {...register('bestTime')} className={input} placeholder="October to February" /></div>
        <div><label className={field}>Google Maps URL</label><input {...register('googleMapsUrl')} type="url" className={input} /></div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 accent-purple-600" />
          <span className="text-sm text-slate-700">Is Featured</span>
        </label>
      </div>

      <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
