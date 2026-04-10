import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import RichTextEditor from '../common/RichTextEditor'
import ImageUpload from '../common/ImageUpload'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import InlineCategoryAdd from '../common/InlineCategoryAdd'
import { newsApi } from '../../services/api'
import { slugify } from '../../utils/helpers'

const lbl = 'block text-sm font-medium mb-1.5'
const lblStyle = { color: '#374151' }
const section = 'rounded-xl p-5 space-y-4'
const sectionStyle = { background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const inp = 'w-full px-3 py-2.5 rounded-lg text-sm'

export default function NewsForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues })
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState(defaultValues?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [body, setBody] = useState(defaultValues?.body || '')
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  const [publishedAt, setPublishedAt] = useState(defaultValues?.publishedAt ? new Date(defaultValues.publishedAt) : new Date())
  const title = watch('title', '')
  const redirectUrl = watch('redirectUrl', '')

  const fetchCategories = () => newsApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  useEffect(() => { fetchCategories() }, [])

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const submit = (data) => {
    onSubmit({ ...data, body, thumbnail, tags, publishedAt: publishedAt?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Basic Info</h3>
        <div>
          <label htmlFor="news-title" className={lbl} style={lblStyle}>Title *</label>
          <input id="news-title" name="title" autoComplete="off"
            {...register('title', { required: 'Required' })} maxLength={200} className={inp} />
          {title && <p className="text-xs mt-1" style={{ color: '#475569' }}>Slug: {slugify(title)}</p>}
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
          <select id="news-category" name="category"
            {...register('category', { required: 'Required' })} className={inp}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {errors.category && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.category.message}</p>}
        </div>
        <ImageUpload label="Thumbnail *" value={thumbnail} onChange={setThumbnail} />
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
            <label className={lbl} style={lblStyle}>Body Content</label>
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
        <h3 className="font-semibold text-slate-800">Tags & Meta</h3>
        <div>
          <label htmlFor="news-tags" className={lbl} style={lblStyle}>Tags</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ background: '#EDE9FE', color: '#6D28D9' }}>
                {t}
                <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}
                  className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <input id="news-tags" name="tags" autoComplete="off"
            value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag}
            placeholder="Type and press Enter" className={inp} />
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="news-breaking" name="isBreaking" {...register('isBreaking')} />
            <span className="text-sm" style={{ color: '#374151' }}>Is Breaking</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="news-featured" name="isFeatured" {...register('isFeatured')} />
            <span className="text-sm" style={{ color: '#374151' }}>Is Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="news-important" name="isImportant" {...register('isImportant')} />
            <span className="text-sm" style={{ color: '#374151' }}>
              Is Important <span style={{ color: '#94A3B8', fontWeight: 400 }}>(max 3 per category — shown as main news)</span>
            </span>
          </label>
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Publish Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="news-publishedat" className={lbl} style={lblStyle}>Published At *</label>
            <DatePicker id="news-publishedat" selected={publishedAt} onChange={setPublishedAt}
              showTimeSelect dateFormat="dd/MM/yyyy HH:mm" className="w-full" />
          </div>
          <div>
            <label htmlFor="news-status" className={lbl} style={lblStyle}>Status *</label>
            <select id="news-status" name="status"
              {...register('status', { required: 'Required' })} className={inp}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">SEO</h3>
        <div>
          <label htmlFor="news-metatitle" className={lbl} style={lblStyle}>Meta Title</label>
          <input id="news-metatitle" name="metaTitle" autoComplete="off"
            {...register('metaTitle')} className={inp} />
        </div>
        <div>
          <label htmlFor="news-metadesc" className={lbl} style={lblStyle}>Meta Description</label>
          <textarea id="news-metadesc" name="metaDescription" autoComplete="off"
            {...register('metaDescription')} rows={2} className={`${inp} resize-none`} />
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
