import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import RichTextEditor from '../common/RichTextEditor'
import ImageUpload from '../common/ImageUpload'
import MapPicker from '../common/MapPicker'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { eventsApi } from '../../services/api'

const field = 'block text-sm font-medium text-slate-700 mb-1'
const input = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

export default function EventForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ defaultValues })
  const [categories, setCategories] = useState([])
  const [description, setDescription] = useState(defaultValues?.description || '')
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  const [startDate, setStartDate] = useState(defaultValues?.startDate ? new Date(defaultValues.startDate) : null)
  const [endDate, setEndDate] = useState(defaultValues?.endDate ? new Date(defaultValues.endDate) : null)
  const [location, setLocation] = useState({ lat: defaultValues?.latitude, lng: defaultValues?.longitude })

  useEffect(() => {
    eventsApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  }, [])

  const submit = (data) => {
    onSubmit({ ...data, description, thumbnail, startDate: startDate?.toISOString(), endDate: endDate?.toISOString(), latitude: location.lat, longitude: location.lng })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        <h3 className="font-semibold text-slate-800">Event Details</h3>
        <div><label className={field}>Event Name *</label><input {...register('eventName', { required: 'Required' })} className={input} /></div>
        <div>
          <label className={field}>Category *</label>
          <select {...register('category', { required: 'Required' })} className={input}>
            <option value="">Select</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={field}>Start Date & Time *</label>
            <DatePicker selected={startDate} onChange={setStartDate} showTimeSelect dateFormat="dd/MM/yyyy HH:mm" className={input} />
          </div>
          <div>
            <label className={field}>End Date & Time *</label>
            <DatePicker selected={endDate} onChange={setEndDate} showTimeSelect dateFormat="dd/MM/yyyy HH:mm" minDate={startDate} className={input} />
          </div>
        </div>
        <div><label className={field}>Venue Name *</label><input {...register('venueName', { required: 'Required' })} className={input} /></div>
        <ImageUpload module="events" label="Thumbnail *" value={thumbnail} onChange={setThumbnail} />
        <div><label className={field}>Description *</label><RichTextEditor value={description} onChange={setDescription} /></div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location (optional)</h3>
        <MapPicker lat={location.lat} lng={location.lng} onChange={(latlng) => setLocation(latlng)} />
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Additional Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={field}>Entry Fee</label><input {...register('entryFee')} className={input} placeholder="₹200 or Free" /></div>
          <div><label className={field}>Organizer</label><input {...register('organizer')} className={input} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={field}>Contact Phone</label><input {...register('contactPhone')} className={input} /></div>
          <div><label className={field}>Ticket URL</label><input {...register('ticketUrl')} type="url" className={input} /></div>
        </div>
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
