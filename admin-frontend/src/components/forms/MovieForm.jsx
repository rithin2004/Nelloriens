import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, X } from 'lucide-react'
import ImageUpload from '../common/ImageUpload'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { moviesApi } from '../../services/api'

const lbl = 'block text-sm font-medium mb-1.5'
const lblStyle = { color: '#374151' }
const section = 'rounded-xl p-5 space-y-4'
const sectionStyle = { background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const inp = 'w-full px-3 py-2.5 rounded-lg text-sm'

export default function MovieForm({ defaultValues, onSubmit, loading, contentId }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  const [theatres, setTheatres] = useState([])
  const [poster, setPoster] = useState(defaultValues?.poster || '')
  const [timings, setTimings] = useState(defaultValues?.showTimings?.length ? defaultValues.showTimings : [''])
  const [runningFrom, setRunningFrom] = useState(defaultValues?.runningFrom ? new Date(defaultValues.runningFrom) : null)
  const [runningUntil, setRunningUntil] = useState(defaultValues?.runningUntil ? new Date(defaultValues.runningUntil) : null)

  useEffect(() => {
    moviesApi.getTheatres().then((r) => setTheatres(r.data?.items || [])).catch(() => {})
  }, [])

  const addTiming = () => setTimings([...timings, ''])
  const updateTiming = (i, v) => { const t = [...timings]; t[i] = v; setTimings(t) }
  const removeTiming = (i) => setTimings(timings.filter((_, idx) => idx !== i))

  const submit = (data) => {
    onSubmit({
      ...data,
      poster,
      showTimings: timings.filter(Boolean),
      runningFrom: runningFrom?.toISOString(),
      runningUntil: runningUntil?.toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Movie Details</h3>

        <div>
          <label htmlFor="mov-name" className={lbl} style={lblStyle}>Movie Name *</label>
          <input id="mov-name" name="movieName" autoComplete="off"
            {...register('movieName', { required: 'Required' })} className={inp} />
          {errors.movieName && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.movieName.message}</p>}
        </div>

        <div>
          <label htmlFor="mov-theatre" className={lbl} style={lblStyle}>Theatre *</label>
          <select id="mov-theatre" name="theatre"
            {...register('theatre', { required: 'Required' })} className={inp}>
            <option value="">Select theatre</option>
            {theatres.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
          {errors.theatre && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.theatre.message}</p>}
        </div>

        <div>
          <label htmlFor="mov-lang" className={lbl} style={lblStyle}>Language *</label>
          <select id="mov-lang" name="language"
            {...register('language', { required: 'Required' })} className={inp}>
            <option value="">Select</option>
            {['Telugu', 'Hindi', 'Tamil', 'English', 'Other'].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className={lbl} style={lblStyle}>Show Timings</label>
          {timings.map((t, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={t} onChange={(e) => updateTiming(i, e.target.value)}
                className={`${inp} flex-1`} placeholder="10:00 AM" autoComplete="off" />
              {timings.length > 1 && (
                <button type="button" onClick={() => removeTiming(i)}
                  className="p-2 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                  style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addTiming}
            className="flex items-center gap-1 text-sm transition-colors"
            style={{ color: '#A78BFA' }}>
            <Plus className="w-4 h-4" /> Add Timing
          </button>
        </div>

        <ImageUpload module="movies" label="Movie Poster" value={poster} onChange={setPoster} contentId={contentId} section="posters" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="mov-from" className={lbl} style={lblStyle}>Running From</label>
            <DatePicker id="mov-from" selected={runningFrom} onChange={setRunningFrom}
              dateFormat="dd/MM/yyyy" className="w-full" placeholderText="Select date" />
          </div>
          <div>
            <label htmlFor="mov-until" className={lbl} style={lblStyle}>Running Until</label>
            <DatePicker id="mov-until" selected={runningUntil} onChange={setRunningUntil}
              dateFormat="dd/MM/yyyy" minDate={runningFrom} className="w-full" isClearable placeholderText="Optional" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="mov-genre" className={lbl} style={lblStyle}>Genre</label>
            <input id="mov-genre" name="genre" autoComplete="off"
              {...register('genre')} className={inp} />
          </div>
          <div>
            <label htmlFor="mov-rating" className={lbl} style={lblStyle}>Rating</label>
            <select id="mov-rating" name="rating"
              {...register('rating')} className={inp}>
              <option value="">Select</option>
              <option value="U">U</option>
              <option value="UA">UA</option>
              <option value="A">A</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="mov-booking" className={lbl} style={lblStyle}>Booking URL</label>
          <input id="mov-booking" name="bookingUrl" type="url" autoComplete="url"
            {...register('bookingUrl')} placeholder="BookMyShow / Paytm" className={inp} />
        </div>

        <div>
          <label htmlFor="mov-trailer" className={lbl} style={lblStyle}>Trailer URL</label>
          <input id="mov-trailer" name="trailerUrl" type="url" autoComplete="url"
            {...register('trailerUrl')} placeholder="YouTube" className={inp} />
        </div>

        <div>
          <label htmlFor="mov-status" className={lbl} style={lblStyle}>Status *</label>
          <select id="mov-status" name="status"
            {...register('status', { required: 'Required' })} className={inp}>
            <option value="now_showing">Now Showing</option>
            <option value="coming_soon">Coming Soon</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Location & Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mov-scope" className={lbl} style={lblStyle}>Scope *</label>
            <select id="mov-scope" name="scope" {...register('scope', { required: 'Required' })} className={inp}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="mov-city" className={lbl} style={lblStyle}>City</label>
            <input id="mov-city" name="city" autoComplete="address-level2"
              {...register('city')} className={inp} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mov-location" className={lbl} style={lblStyle}>Location</label>
            <input id="mov-location" name="location" autoComplete="off"
              {...register('location')} className={inp} />
          </div>
          <div>
            <label htmlFor="mov-region" className={lbl} style={lblStyle}>Region</label>
            <input id="mov-region" name="region" autoComplete="off"
              {...register('region')} className={inp} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
