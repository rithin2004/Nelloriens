import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import ImageUpload from '../common/ImageUpload'
import InlineCategoryAdd from '../common/InlineCategoryAdd'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { sportsApi } from '../../services/api'

const lbl = 'block text-sm font-medium mb-1.5'
const lblStyle = { color: '#374151' }
const section = 'rounded-xl p-5 space-y-4'
const sectionStyle = { background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const inp = 'w-full px-3 py-2.5 rounded-lg text-sm'

export default function SportForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  const [categories, setCategories] = useState([])
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  const [matchDateTime, setMatchDateTime] = useState(defaultValues?.matchDateTime ? new Date(defaultValues.matchDateTime) : null)
  const [publishedAt, setPublishedAt] = useState(defaultValues?.publishedAt ? new Date(defaultValues.publishedAt) : new Date())

  const fetchCategories = () => sportsApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  useEffect(() => { fetchCategories() }, [])

  const submit = (data) => {
    onSubmit({ ...data, thumbnail, matchDateTime: matchDateTime?.toISOString(), publishedAt: publishedAt?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Match Details</h3>

        <div>
          <label htmlFor="sport-title" className={lbl} style={lblStyle}>Title *</label>
          <input id="sport-title" name="title" autoComplete="off"
            {...register('title', { required: 'Required' })} className={inp} />
          {errors.title && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label htmlFor="sport-type" className={lbl} style={{ ...lblStyle, marginBottom: 0 }}>Sport Type *</label>
              <InlineCategoryAdd
                label="Sport Type"
                placeholder="e.g. Cricket"
                onAdd={async (name) => {
                  await sportsApi.createCategory({ name })
                  await fetchCategories()
                }}
              />
            </div>
            <select id="sport-type" name="sportType"
              {...register('sportType', { required: 'Required' })} className={inp}>
              <option value="">Select</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="sport-status" className={lbl} style={lblStyle}>Match Status *</label>
            <select id="sport-status" name="matchStatus"
              {...register('matchStatus', { required: 'Required' })} className={inp}>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="sport-datetime" className={lbl} style={lblStyle}>Match Date & Time *</label>
          <DatePicker id="sport-datetime" selected={matchDateTime} onChange={setMatchDateTime}
            showTimeSelect dateFormat="dd/MM/yyyy HH:mm" className="w-full" placeholderText="Select date & time" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sport-teama" className={lbl} style={lblStyle}>Team A</label>
            <input id="sport-teama" name="teamA" autoComplete="off"
              {...register('teamA')} className={inp} />
          </div>
          <div>
            <label htmlFor="sport-teamb" className={lbl} style={lblStyle}>Team B</label>
            <input id="sport-teamb" name="teamB" autoComplete="off"
              {...register('teamB')} className={inp} />
          </div>
        </div>

        <div>
          <label htmlFor="sport-venue" className={lbl} style={lblStyle}>Venue</label>
          <input id="sport-venue" name="venue" autoComplete="off"
            {...register('venue')} className={inp} />
        </div>
        <div>
          <label htmlFor="sport-stream" className={lbl} style={lblStyle}>Live Stream URL</label>
          <input id="sport-stream" name="liveStreamUrl" type="url" autoComplete="url"
            {...register('liveStreamUrl')} placeholder="YouTube/Hotstar" className={inp} />
        </div>
        <div>
          <label htmlFor="sport-scoreurl" className={lbl} style={lblStyle}>External Score URL</label>
          <input id="sport-scoreurl" name="externalScoreUrl" type="url" autoComplete="url"
            {...register('externalScoreUrl')} placeholder="Cricbuzz/ESPN" className={inp} />
        </div>

        <ImageUpload module="sports" label="Thumbnail" value={thumbnail} onChange={setThumbnail} />

        <div>
          <label htmlFor="sport-shortdesc" className={lbl} style={lblStyle}>Short Description</label>
          <textarea id="sport-shortdesc" name="shortDescription" autoComplete="off"
            {...register('shortDescription')} rows={2} className={`${inp} resize-none`} />
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="sport-featured" name="isFeatured" {...register('isFeatured')} />
          <span className="text-sm" style={{ color: '#374151' }}>Is Featured</span>
        </label>
        <div>
          <label htmlFor="sport-publishedat" className={lbl} style={lblStyle}>Published At *</label>
          <DatePicker id="sport-publishedat" selected={publishedAt} onChange={setPublishedAt}
            showTimeSelect dateFormat="dd/MM/yyyy HH:mm" className="w-full" />
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
