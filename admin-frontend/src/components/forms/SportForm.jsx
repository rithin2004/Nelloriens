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
    defaultValues: { type: 'livescore', ...defaultValues },
  })
  const [categories,  setCategories]  = useState([])
  const [thumbnail,   setThumbnail]   = useState(defaultValues?.thumbnail || '')
  const [validUpto,   setValidUpto]   = useState(
    defaultValues?.validUpto ? new Date(defaultValues.validUpto) : null
  )
  const [publishedAt, setPublishedAt] = useState(
    defaultValues?.publishedAt ? new Date(defaultValues.publishedAt) : new Date()
  )

  const type = watch('type')

  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])

  const fetchCategories = () => sportsApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
  useEffect(() => { fetchCategories() }, [])

  const submit = (data) => {
    if (type === 'livescore') {
      onSubmit({ sportName: data.sportName, liveUrl: data.liveUrl, type: 'livescore' })
      return
    }
    const payload = {
      ...data,
      thumbnail,
      publishedAt: publishedAt?.toISOString(),
    }
    if (type === 'upcoming') payload.validUpto = validUpto?.toISOString() ?? null
    onSubmit(payload)
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
              <option value="livescore">Live Score</option>
              <option value="upcoming">Upcoming Event</option>
              <option value="article">News / Article</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Live Score fields ── */}
      {type === 'livescore' && (
        <div className={section} style={sectionStyle}>
          <h3 className="font-semibold text-slate-800">Live Score Link</h3>
          <div>
            <label htmlFor="sport-name" className={lbl} style={lblStyle}>Sport / Match Name *</label>
            <input id="sport-name" name="sportName" autoComplete="off"
              {...register('sportName', { required: 'Sport name is required' })}
              placeholder="e.g. Cricket — AP vs Hyderabad"
              className={inp} style={inpStyle} />
            {errors.sportName && <p className="text-xs mt-1 text-red-600">{errors.sportName.message}</p>}
          </div>
          <div>
            <label htmlFor="sport-liveurl" className={lbl} style={lblStyle}>Live Score URL *</label>
            <input id="sport-liveurl" name="liveUrl" type="url" autoComplete="url"
              {...register('liveUrl', { required: 'Live URL is required' })}
              placeholder="https://cricbuzz.com/..."
              className={inp} style={inpStyle} />
            {errors.liveUrl && <p className="text-xs mt-1 text-red-600">{errors.liveUrl.message}</p>}
          </div>
        </div>
      )}

      {/* Common fields for upcoming + article */}
      {type !== 'livescore' && (
        <div className={section} style={sectionStyle}>
          <h3 className="font-semibold text-slate-800">
            {type === 'upcoming' ? 'Event Details' : 'Article Details'}
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
      )}

      {/* ── Upcoming Event fields ── */}
      {type === 'upcoming' && (
        <div className={section} style={sectionStyle}>
          <h3 className="font-semibold text-slate-800">Event Schedule</h3>

          <div>
            <label htmlFor="sport-validupto" className={lbl} style={lblStyle}>Valid Upto *</label>
            <Controller
              control={control}
              name="_validUptoCtrl"
              render={() => (
                <DatePicker
                  id="sport-validupto"
                  selected={validUpto}
                  onChange={setValidUpto}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="Event ends at (date & time)"
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

      {/* Location & Scope — for upcoming and article */}
      {type !== 'livescore' && (
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
      )}

      {/* Published At — not needed for live scores */}
      {type !== 'livescore' && (
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
      )}

      <button type="submit" disabled={loading}
        className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
