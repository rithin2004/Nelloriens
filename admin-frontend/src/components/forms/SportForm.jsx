import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }

export default function SportForm({ defaultValues, onSubmit, loading, contentId, onDirtyChange }) {
  const { register, handleSubmit, control, watch, formState: { errors, isDirty } } = useForm({
    defaultValues: { type: 'entry', ...defaultValues },
  })
  const [categories, setCategories] = useState([])
  const [thumbnail,    setThumbnail]    = useState(defaultValues?.thumbnail || '')
  const [photos,       setPhotos]       = useState(defaultValues?.photos || [])
  const [matchDateTime, setMatchDateTime] = useState(
    defaultValues?.matchDateTime ? new Date(defaultValues.matchDateTime) : null
  )
  const [publishedAt, setPublishedAt] = useState(
    defaultValues?.publishedAt ? new Date(defaultValues.publishedAt) : new Date()
  )

  const type = watch('type')

  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])

  const fetchCategories = () => sportsApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
  useEffect(() => { fetchCategories() }, [])

  const submit = (data) => {
    const payload = {
      ...data,
      thumbnail,
      publishedAt: publishedAt?.toISOString(),
    }
    if (type === 'upcoming') payload.matchDateTime = matchDateTime?.toISOString()
    if (type === 'entry')    payload.photos = photos
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">

      {/* Type selector — only shown on create (no editId = no pre-set type) */}
      {!defaultValues?._id && (
        <div className={section} style={sectionStyle}>
          <div>
            <label htmlFor="sport-type-select" className={lbl} style={lblStyle}>Section *</label>
            <select id="sport-type-select" name="type" autoComplete="off"
              {...register('type', { required: true })}
              className={inp} style={inpStyle}>
              <option value="entry">Sports Entry</option>
              <option value="upcoming">Upcoming Sport</option>
              <option value="article">News / Article</option>
            </select>
          </div>
        </div>
      )}

      {/* Common fields for all types */}
      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">
          {type === 'entry' ? 'Entry Details' : type === 'upcoming' ? 'Event Details' : 'Article Details'}
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

        {/* Thumbnail — all types */}
        <ImageUpload
          module="sports" label="Thumbnail *" value={thumbnail}
          onChange={setThumbnail} contentId={contentId} section="thumbnails"
        />
      </div>

      {/* ── Sports Entry fields ── */}
      {type === 'entry' && (
        <div className={section} style={sectionStyle}>
          <h3 className="font-semibold text-slate-800">Entry Media & Links</h3>

          <div>
            <label htmlFor="sport-livescore" className={lbl} style={lblStyle}>Live Score URL</label>
            <input id="sport-livescore" name="liveScoreUrl" type="url" autoComplete="url"
              {...register('liveScoreUrl')} placeholder="Generic live score link"
              className={inp} style={inpStyle} />
          </div>

          <div>
            <p className={lbl} style={lblStyle}>Photos (up to 5)</p>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="mb-2">
                <ImageUpload
                  module="sports" label={`Photo ${i + 1}`}
                  value={photos[i] || ''}
                  onChange={(url) => {
                    const next = [...photos]
                    next[i] = url
                    setPhotos(next.filter(Boolean).slice(0, 5))
                  }}
                  contentId={`${contentId}/${i + 1}`}
                  section="photos"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sport-location" className={lbl} style={lblStyle}>Location</label>
              <input id="sport-location" name="location" autoComplete="off"
                {...register('location')} className={inp} style={inpStyle} />
            </div>
            <div>
              <label htmlFor="sport-scope" className={lbl} style={lblStyle}>Scope *</label>
              <select id="sport-scope" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={inp} style={inpStyle}>
                <option value="nellore">Nellore</option>
                <option value="worldwide">Worldwide</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sport-city" className={lbl} style={lblStyle}>City</label>
              <input id="sport-city" name="city" autoComplete="address-level2"
                {...register('city')} className={inp} style={inpStyle} />
            </div>
            <div>
              <label htmlFor="sport-region" className={lbl} style={lblStyle}>Region</label>
              <input id="sport-region" name="region" autoComplete="off"
                {...register('region')} className={inp} style={inpStyle} />
            </div>
          </div>
        </div>
      )}

      {/* ── Upcoming Sport fields ── */}
      {type === 'upcoming' && (
        <div className={section} style={sectionStyle}>
          <h3 className="font-semibold text-slate-800">Event Schedule</h3>

          <div>
            <label htmlFor="sport-datetime" className={lbl} style={lblStyle}>Date & Time *</label>
            <Controller
              control={control}
              name="_matchDateTimeCtrl"
              render={() => (
                <DatePicker
                  id="sport-datetime"
                  selected={matchDateTime}
                  onChange={setMatchDateTime}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="Select date & time"
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={inpStyle}
                />
              )}
            />
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
            <label htmlFor="sport-matchstatus" className={lbl} style={lblStyle}>Match Status</label>
            <select id="sport-matchstatus" name="matchStatus" autoComplete="off" {...register('matchStatus')} className={inp} style={inpStyle}>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label htmlFor="sport-stream" className={lbl} style={lblStyle}>Live Stream URL</label>
            <input id="sport-stream" name="liveStreamUrl" type="url" autoComplete="url"
              {...register('liveStreamUrl')} placeholder="YouTube/streaming link"
              className={inp} style={inpStyle} />
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

      {/* Location & Scope — for upcoming and article types (entry type has these in its own section) */}
      {type !== 'entry' && (
        <div className={section} style={sectionStyle}>
          <h3 className="font-semibold text-slate-800">Location & Scope</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sport-scope2" className={lbl} style={lblStyle}>Scope *</label>
              <select id="sport-scope2" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={inp} style={inpStyle}>
                <option value="nellore">Nellore</option>
                <option value="worldwide">Worldwide</option>
              </select>
            </div>
            <div>
              <label htmlFor="sport-city2" className={lbl} style={lblStyle}>City</label>
              <input id="sport-city2" name="city" autoComplete="address-level2"
                {...register('city')} className={inp} style={inpStyle} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sport-location2" className={lbl} style={lblStyle}>Location</label>
              <input id="sport-location2" name="location" autoComplete="off"
                {...register('location')} className={inp} style={inpStyle} />
            </div>
            <div>
              <label htmlFor="sport-region2" className={lbl} style={lblStyle}>Region</label>
              <input id="sport-region2" name="region" autoComplete="off"
                {...register('region')} className={inp} style={inpStyle} />
            </div>
          </div>
        </div>
      )}

      {/* Published At */}
      <div className={section} style={sectionStyle}>
        <div>
          <label htmlFor="sport-publishedat" className={lbl} style={lblStyle}>Published At *</label>
          <Controller
            control={control}
            name="_publishedAtCtrl"
            render={() => (
              <DatePicker
                id="sport-publishedat"
                selected={publishedAt}
                onChange={setPublishedAt}
                showTimeSelect
                dateFormat="dd/MM/yyyy HH:mm"
                className="w-full px-3 py-2.5 rounded-lg text-sm"
                style={inpStyle}
              />
            )}
          />
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
