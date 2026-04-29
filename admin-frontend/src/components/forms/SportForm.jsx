import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import ImageUpload from '../common/ImageUpload'
import InlineCategoryAdd from '../common/InlineCategoryAdd'
import DateField from '../common/DateField'
import { sportsApi } from '../../services/api'

const lbl = 'block text-sm font-medium mb-1.5'
const lblStyle = { color: '#374151' }
const section = 'rounded-xl p-5 space-y-4'
const sectionStyle = { background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const inp = 'w-full px-3 py-2.5 rounded-lg text-sm'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }

export default function SportForm({ defaultValues, onSubmit, loading, contentId, onDirtyChange }) {
  const { register, handleSubmit, control, watch, formState: { errors, isDirty } } = useForm({
    defaultValues: { type: 'event', ...defaultValues },
  })
  const [categories,  setCategories]  = useState([])
  const [thumbnail,   setThumbnail]   = useState(defaultValues?.thumbnail || '')
  const [eventDate,   setEventDate]   = useState(
    defaultValues?.eventDate ? new Date(defaultValues.eventDate) : null
  )

  const type = watch('type')

  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])

  const fetchCategories = () => sportsApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
  useEffect(() => { fetchCategories() }, [])

  const submit = (data) => {
    onSubmit({
      ...data,
      thumbnail,
      ...(type === 'event' ? { eventDate: eventDate?.toISOString() ?? null } : {}),
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">

      {/* Type selector — only shown on create */}
      {!defaultValues?._id && (
        <div className={section} style={sectionStyle}>
          <div>
            <label htmlFor="sport-type-select" className={lbl} style={lblStyle}>Section *</label>
            <select id="sport-type-select" name="type" autoComplete="off"
              {...register('type', { required: true })}
              className={inp} style={inpStyle}>
              <option value="event">Sports Event</option>
              <option value="article">News / Article</option>
            </select>
          </div>
        </div>
      )}

      {/* Common fields */}
      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">
          {type === 'event' ? 'Event Details' : 'Article Details'}
        </h3>

        <div>
          <label htmlFor="sport-title" className={lbl} style={lblStyle}>Title *</label>
          <input id="sport-title" name="title" autoComplete="off"
            {...register('title', { required: 'Title is required' })}
            className={inp} style={inpStyle} />
          {errors.title && <p className="text-xs mt-1 text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <label htmlFor="sport-category" className={lbl} style={{ ...lblStyle, marginBottom: 0 }}>Category *</label>
            <InlineCategoryAdd
              label="Category"
              placeholder="e.g. Cricket"
              onAdd={async (name) => { await sportsApi.createCategory({ name }); await fetchCategories() }}
            />
          </div>
          <select id="sport-category" name="category" autoComplete="off"
            {...register('category', { required: 'Category is required' })}
            className={inp} style={inpStyle}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {errors.category && <p className="text-xs mt-1 text-red-600">{errors.category.message}</p>}
        </div>

        <div>
          <label htmlFor="sport-description" className={lbl} style={lblStyle}>Description</label>
          <textarea id="sport-description" name="description" autoComplete="off"
            {...register('description')} rows={3}
            className={`${inp} resize-none`} style={inpStyle} />
        </div>

        <ImageUpload
          module="sports" label="Thumbnail *" value={thumbnail}
          onChange={setThumbnail} contentId={contentId} section="thumbnails"
        />
      </div>

      {/* ── Sports Event fields ── */}
      {type === 'event' && (
        <div className={section} style={sectionStyle}>
          <h3 className="font-semibold text-slate-800">Event Schedule</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sport-eventdate" className={lbl} style={lblStyle}>Event Date & Time</label>
              <Controller
                control={control}
                name="_eventDateCtrl"
                render={() => (
                  <DateField
                    id="sport-eventdate"
                    selected={eventDate}
                    onChange={setEventDate}
                    showTimeSelect
                    dateFormat="dd/MM/yyyy HH:mm"
                    placeholderText="Event start date & time"
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={inpStyle}
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="sport-duration" className={lbl} style={lblStyle}>Duration (minutes)</label>
              <input id="sport-duration" name="duration" type="number" min="1" autoComplete="off"
                {...register('duration')} className={inp} style={inpStyle} placeholder="e.g. 120" />
            </div>
          </div>

          <div>
            <label htmlFor="sport-venue" className={lbl} style={lblStyle}>Venue</label>
            <input id="sport-venue" name="venue" autoComplete="off"
              {...register('venue')} className={inp} style={inpStyle} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sport-teama" className={lbl} style={lblStyle}>Team A</label>
              <input id="sport-teama" name="teamA" autoComplete="off"
                {...register('teamA')} className={inp} style={inpStyle} />
            </div>
            <div>
              <label htmlFor="sport-teamb" className={lbl} style={lblStyle}>Team B</label>
              <input id="sport-teamb" name="teamB" autoComplete="off"
                {...register('teamB')} className={inp} style={inpStyle} />
            </div>
          </div>

          <div>
            <label htmlFor="sport-liveurl" className={lbl} style={lblStyle}>Live Score URL</label>
            <input id="sport-liveurl" name="liveUrl" type="url" autoComplete="url"
              {...register('liveUrl')} placeholder="External live score link (optional)"
              className={inp} style={inpStyle} />
          </div>

          <div>
            <label htmlFor="sport-result" className={lbl} style={lblStyle}>Result</label>
            <textarea id="sport-result" name="result" autoComplete="off"
              {...register('result')} rows={2} placeholder="Fill after event completes"
              className={`${inp} resize-none`} style={inpStyle} />
          </div>
        </div>
      )}

      {/* ── Article fields ── */}
      {type === 'article' && (
        <div className={section} style={sectionStyle}>
          <h3 className="font-semibold text-slate-800">Article Content</h3>
          <div>
            <label htmlFor="sport-content" className={lbl} style={lblStyle}>Content</label>
            <textarea id="sport-content" name="content" autoComplete="off"
              {...register('content')} rows={6}
              className={`${inp} resize-none`} style={inpStyle} />
          </div>
        </div>
      )}

      {/* Location & Scope */}
      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Location & Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sport-scope" className={lbl} style={lblStyle}>Scope *</label>
            <select id="sport-scope" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={inp} style={inpStyle}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="sport-city" className={lbl} style={lblStyle}>City</label>
            <input id="sport-city" name="city" autoComplete="address-level2"
              {...register('city')} className={inp} style={inpStyle} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sport-location" className={lbl} style={lblStyle}>Location</label>
            <input id="sport-location" name="location" autoComplete="off"
              {...register('location')} className={inp} style={inpStyle} />
          </div>
          <div>
            <label htmlFor="sport-region" className={lbl} style={lblStyle}>Region</label>
            <input id="sport-region" name="region" autoComplete="off"
              {...register('region')} className={inp} style={inpStyle} />
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
