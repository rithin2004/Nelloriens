import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import RichTextEditor from '../common/RichTextEditor'
import ImageUpload from '../common/ImageUpload'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import InlineCategoryAdd from '../common/InlineCategoryAdd'
import { newsApi } from '../../services/api'

const lbl = 'block text-sm font-medium mb-1.5'
const lblStyle = { color: '#374151' }
const section = 'rounded-xl p-5 space-y-4'
const sectionStyle = { background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const inp = 'w-full px-3 py-2.5 rounded-lg text-sm'

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

export default function NewsForm({ defaultValues, onSubmit, loading, contentId }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues })
  const [categories, setCategories] = useState([])
  const [isImportant, setIsImportant] = useState(defaultValues?.isImportant || false)
  const [body, setBody] = useState(defaultValues?.body || '')
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  const [publishedAt, setPublishedAt] = useState(defaultValues?.publishedAt ? new Date(defaultValues.publishedAt) : new Date())
  const redirectUrl = watch('redirectUrl', '')

  const fetchCategories = () => newsApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
  useEffect(() => { fetchCategories() }, [])

  const submit = (data) => {
    onSubmit({ ...data, body, thumbnail, isImportant, publishedAt: publishedAt?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section} style={sectionStyle}>
        {/* RULE 13 — isImportant toggle top-right, visual switch only */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Basic Info</h3>
          <ToggleSwitch id="news-important" checked={isImportant} onChange={setIsImportant}
            label="Important" hint="(max 3 per category)" />
        </div>
        <div>
          <label htmlFor="news-title" className={lbl} style={lblStyle}>Title *</label>
          <input id="news-title" name="title" autoComplete="off"
            {...register('title', { required: 'Required' })} maxLength={200} className={inp} />
          {errors.title && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.title.message}</p>}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <label htmlFor="news-category" className={lbl} style={{ ...lblStyle, marginBottom: 0 }}>Category *</label>
            <InlineCategoryAdd
              label="Category"
              placeholder="e.g. Politics"
              onAdd={async (name) => {
                await newsApi.createCategory({ name })
                await fetchCategories()
              }}
            />
          </div>
          <select id="news-category" name="category" autoComplete="off"
            {...register('category', { required: 'Required' })} className={inp}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {errors.category && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.category.message}</p>}
        </div>
        <ImageUpload module="news" label="Thumbnail *" value={thumbnail} onChange={setThumbnail} contentId={contentId} section="thumbnails" />
        <div>
          <label htmlFor="news-shortdesc" className={lbl} style={lblStyle}>
            Short Description * <span style={{ color: '#475569', fontWeight: 400 }}>(max 300)</span>
          </label>
          <textarea id="news-shortdesc" name="shortDescription" autoComplete="off"
            {...register('shortDescription', { required: 'Required', maxLength: 300 })} rows={3}
            className={`${inp} resize-none`} />
          {errors.shortDescription && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.shortDescription.message}</p>}
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Content</h3>
        <div>
          <label htmlFor="news-redirect" className={lbl} style={lblStyle}>
            Redirect URL <span style={{ color: '#475569', fontWeight: 400 }}>(optional — hides body if filled)</span>
          </label>
          <input id="news-redirect" name="redirectUrl" type="url" autoComplete="url"
            {...register('redirectUrl')} placeholder="https://" className={inp} />
        </div>
        {!redirectUrl && (
          <div>
            <p className={lbl} style={lblStyle}>Body Content</p>
            <RichTextEditor value={body} onChange={setBody} />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="news-author" className={lbl} style={lblStyle}>Author Name</label>
            <input id="news-author" name="authorName" autoComplete="name"
              {...register('authorName')} className={inp} />
          </div>
          <div>
            <label htmlFor="news-source" className={lbl} style={lblStyle}>Source Name</label>
            <input id="news-source" name="sourceName" autoComplete="organization"
              {...register('sourceName')} className={inp} />
          </div>
        </div>
        <div>
          <label htmlFor="news-sourceurl" className={lbl} style={lblStyle}>Source URL</label>
          <input id="news-sourceurl" name="sourceUrl" type="url" autoComplete="url"
            {...register('sourceUrl')} placeholder="https://" className={inp} />
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Publish Settings</h3>
        <div>
          <label htmlFor="news-publishedat" className={lbl} style={lblStyle}>Published At *</label>
          <DatePicker id="news-publishedat" selected={publishedAt} onChange={setPublishedAt}
            showTimeSelect dateFormat="dd/MM/yyyy HH:mm" className="w-full" />
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Location & Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="news-scope" className={lbl} style={lblStyle}>Scope *</label>
            <select id="news-scope" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={inp}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="news-city" className={lbl} style={lblStyle}>City</label>
            <input id="news-city" name="city" autoComplete="address-level2"
              {...register('city')} className={inp} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="news-location" className={lbl} style={lblStyle}>Location</label>
            <input id="news-location" name="location" autoComplete="off"
              {...register('location')} className={inp} />
          </div>
          <div>
            <label htmlFor="news-region" className={lbl} style={lblStyle}>Region</label>
            <input id="news-region" name="region" autoComplete="off"
              {...register('region')} className={inp} />
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
