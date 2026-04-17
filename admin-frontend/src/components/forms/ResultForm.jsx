import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import RichTextEditor from '../common/RichTextEditor'
import ImageUpload from '../common/ImageUpload'
import InlineCategoryAdd from '../common/InlineCategoryAdd'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { resultsApi } from '../../services/api'

const lbl = 'block text-sm font-medium mb-1.5'
const lblStyle = { color: '#374151' }
const section = 'rounded-xl p-5 space-y-4'
const sectionStyle = { background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const inp = 'w-full px-3 py-2.5 rounded-lg text-sm'

export default function ResultForm({ defaultValues, onSubmit, loading, contentId }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  const [categories, setCategories] = useState([])
  const [details, setDetails] = useState(defaultValues?.fullDetails || '')
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  const [resultDate, setResultDate] = useState(defaultValues?.resultDate ? new Date(defaultValues.resultDate) : null)
  const [publishedAt, setPublishedAt] = useState(defaultValues?.publishedAt ? new Date(defaultValues.publishedAt) : new Date())

  const fetchCategories = () => resultsApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  useEffect(() => { fetchCategories() }, [])

  const submit = (data) => {
    onSubmit({ ...data, fullDetails: details, thumbnail, resultDate: resultDate?.toISOString(), publishedAt: publishedAt?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Result Details</h3>

        <div>
          <label htmlFor="result-exam" className={lbl} style={lblStyle}>Exam Name *</label>
          <input id="result-exam" name="examName" autoComplete="off"
            {...register('examName', { required: 'Required' })} className={inp} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <label htmlFor="result-category" className={lbl} style={{ ...lblStyle, marginBottom: 0 }}>Category *</label>
            <InlineCategoryAdd
              label="Category"
              placeholder="e.g. UPSC"
              onAdd={async (name) => {
                await resultsApi.createCategory({ name })
                await fetchCategories()
              }}
            />
          </div>
          <select id="result-category" name="category"
            {...register('category', { required: 'Required' })} className={inp}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {errors.category && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.category.message}</p>}
        </div>

        <div>
          <label htmlFor="result-date" className={lbl} style={lblStyle}>Result Date *</label>
          <DatePicker id="result-date" selected={resultDate} onChange={setResultDate}
            dateFormat="dd/MM/yyyy" className="w-full" placeholderText="Select date" />
        </div>

        <div>
          <label htmlFor="result-shortdesc" className={lbl} style={lblStyle}>Short Description *</label>
          <textarea id="result-shortdesc" name="shortDescription" autoComplete="off"
            {...register('shortDescription', { required: 'Required' })} rows={3}
            className={`${inp} resize-none`} />
        </div>

        <div>
          <label htmlFor="result-redirect" className={lbl} style={lblStyle}>Redirect URL (Official Portal)</label>
          <input id="result-redirect" name="redirectUrl" type="url" autoComplete="url"
            {...register('redirectUrl')} placeholder="https://" className={inp} />
        </div>

        <div>
          <label className={lbl} style={lblStyle}>Full Details</label>
          <RichTextEditor value={details} onChange={setDetails} />
        </div>

        <ImageUpload module="results" label="Thumbnail" value={thumbnail} onChange={setThumbnail} contentId={contentId} section="thumbnails" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="result-body" className={lbl} style={lblStyle}>Conducting Body</label>
            <input id="result-body" name="conductingBody" autoComplete="organization"
              {...register('conductingBody')} placeholder="BSEAP, NTA..." className={inp} />
          </div>
          <div>
            <label htmlFor="result-year" className={lbl} style={lblStyle}>Year</label>
            <input id="result-year" name="year" type="number" autoComplete="off"
              {...register('year')} className={inp} />
          </div>
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <div>
          <label htmlFor="result-publishedat" className={lbl} style={lblStyle}>Published At *</label>
          <DatePicker id="result-publishedat" selected={publishedAt} onChange={setPublishedAt}
            showTimeSelect dateFormat="dd/MM/yyyy HH:mm" className="w-full" />
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Location & Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="result-scope" className={lbl} style={lblStyle}>Scope *</label>
            <select id="result-scope" name="scope" {...register('scope', { required: 'Required' })} className={inp}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="result-city" className={lbl} style={lblStyle}>City</label>
            <input id="result-city" name="city" autoComplete="address-level2"
              {...register('city')} className={inp} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="result-location" className={lbl} style={lblStyle}>Location</label>
            <input id="result-location" name="location" autoComplete="off"
              {...register('location')} className={inp} />
          </div>
          <div>
            <label htmlFor="result-region" className={lbl} style={lblStyle}>Region</label>
            <input id="result-region" name="region" autoComplete="off"
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
