import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import RichTextEditor from '../common/RichTextEditor'
import ImageUpload from '../common/ImageUpload'
import InlineCategoryAdd from '../common/InlineCategoryAdd'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { jobsApi } from '../../services/api'

/** Company logo upload with initial-letter fallback */
function CompanyLogoField({ logo, onChange, companyName }) {
  const initial = companyName?.[0]?.toUpperCase() || 'C'
  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']
  const color = colors[(companyName?.charCodeAt(0) || 0) % colors.length]

  return (
    <div>
      <p className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Company Logo</p>
      <div className="flex items-center gap-3">
        {/* Preview */}
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
          style={{ background: logo ? 'transparent' : color, border: '1px solid #E2E8F0' }}>
          {logo
            ? <img src={logo} alt="logo" className="w-full h-full object-cover" />
            : <span className="text-white font-bold text-lg">{initial}</span>
          }
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="url" placeholder="Paste logo URL"
            value={logo} onChange={(e) => onChange(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg text-xs"
            style={{ background: '#eef3fd', border: '1px solid #dce8fb', color: '#0F172A' }}
          />
          {logo && (
            <button type="button" onClick={() => onChange('')}
              className="text-xs text-left transition-colors" style={{ color: '#EF4444' }}>
              Remove logo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const lbl = 'block text-sm font-medium mb-1.5'
const lblStyle = { color: '#374151' }
const section = 'rounded-xl p-5 space-y-4'
const sectionStyle = { background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const inp = 'w-full px-3 py-2.5 rounded-lg text-sm'

export default function JobForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [description, setDescription] = useState(defaultValues?.fullDescription || '')
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  const [companyLogo, setCompanyLogo] = useState(defaultValues?.companyLogo || '')
  const [tags, setTags] = useState(defaultValues?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [lastDate, setLastDate] = useState(defaultValues?.lastDate ? new Date(defaultValues.lastDate) : null)
  const [publishedAt, setPublishedAt] = useState(defaultValues?.publishedAt ? new Date(defaultValues.publishedAt) : new Date())

  const fetchCategories = () => jobsApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  const fetchLocations  = () => jobsApi.getLocations().then((r)  => setLocations(r.data  || [])).catch(() => {})

  useEffect(() => { fetchCategories(); fetchLocations() }, [])

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const submit = (data) => {
    onSubmit({ ...data, fullDescription: description, thumbnail, companyLogo, tags, lastDate: lastDate?.toISOString(), publishedAt: publishedAt?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Job Details</h3>

        <div>
          <label htmlFor="job-title" className={lbl} style={lblStyle}>Title *</label>
          <input id="job-title" name="title" autoComplete="off"
            {...register('title', { required: 'Required' })} className={inp} />
          {errors.title && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <label htmlFor="job-company" className={lbl} style={lblStyle}>Company / Org Name *</label>
            <input id="job-company" name="companyName" autoComplete="organization"
              {...register('companyName', { required: 'Required' })} className={inp} />
          </div>
          <CompanyLogoField logo={companyLogo} onChange={setCompanyLogo} companyName={defaultValues?.companyName} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            {/* Category with inline add */}
            <div className="flex items-center gap-2 mb-1.5">
              <label htmlFor="job-category" className={lbl} style={{ ...lblStyle, marginBottom: 0 }}>Category *</label>
              <InlineCategoryAdd
                label="Category"
                placeholder="e.g. Government"
                onAdd={async (name) => {
                  await jobsApi.createCategory({ name })
                  await fetchCategories()
                }}
              />
            </div>
            <select id="job-category" name="category"
              {...register('category', { required: 'Required' })} className={inp}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {errors.category && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.category.message}</p>}
          </div>

          <div>
            <label htmlFor="job-exptype" className={lbl} style={lblStyle}>Experience Type *</label>
            <select id="job-exptype" name="experienceType"
              {...register('experienceType', { required: 'Required' })} className={inp}>
              <option value="">Select</option>
              <option value="fresher">Fresher</option>
              <option value="experienced">Experienced</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        <div>
          {/* Location with inline add */}
          <div className="flex items-center gap-2 mb-1.5">
            <label htmlFor="job-location" className={lbl} style={{ ...lblStyle, marginBottom: 0 }}>Location *</label>
            <InlineCategoryAdd
              label="Location"
              placeholder="e.g. Nellore"
              onAdd={async (name) => {
                await jobsApi.createLocation({ name })
                await fetchLocations()
              }}
            />
          </div>
          <select id="job-location" name="location"
            {...register('location', { required: 'Required' })} className={inp}>
            <option value="">Select location</option>
            {locations.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          {errors.location && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.location.message}</p>}
        </div>

        <div>
          <label htmlFor="job-shortdesc" className={lbl} style={lblStyle}>Short Description * (max 300)</label>
          <textarea id="job-shortdesc" name="shortDescription" autoComplete="off"
            {...register('shortDescription', { required: 'Required', maxLength: 300 })} rows={3}
            className={`${inp} resize-none`} />
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Additional Info</h3>
        <div>
          <label htmlFor="job-redirect" className={lbl} style={lblStyle}>Redirect URL</label>
          <input id="job-redirect" name="redirectUrl" type="url" autoComplete="url"
            {...register('redirectUrl')} placeholder="https://" className={inp} />
        </div>
        <div>
          <label className={lbl} style={lblStyle}>Full Description</label>
          <RichTextEditor value={description} onChange={setDescription} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="job-vacancy" className={lbl} style={lblStyle}>Vacancy Count</label>
            <input id="job-vacancy" name="vacancyCount" type="number" min="0" autoComplete="off"
              {...register('vacancyCount')} className={inp} />
          </div>
          <div>
            <label htmlFor="job-salary" className={lbl} style={lblStyle}>Salary Range</label>
            <input id="job-salary" name="salaryRange" autoComplete="off"
              {...register('salaryRange')} placeholder="₹20,000–₹35,000" className={inp} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="job-qual" className={lbl} style={lblStyle}>Qualification</label>
            <input id="job-qual" name="qualification" autoComplete="off"
              {...register('qualification')} className={inp} />
          </div>
          <div>
            <label htmlFor="job-age" className={lbl} style={lblStyle}>Age Limit</label>
            <input id="job-age" name="ageLimit" autoComplete="off"
              {...register('ageLimit')} placeholder="18–35 years" className={inp} />
          </div>
        </div>
        <div>
          <label htmlFor="job-lastdate" className={lbl} style={lblStyle}>Last Date (Deadline)</label>
          <DatePicker id="job-lastdate" selected={lastDate} onChange={setLastDate}
            dateFormat="dd/MM/yyyy" className="w-full" placeholderText="Select date" isClearable />
        </div>
        <ImageUpload module="jobs" label="Thumbnail" value={thumbnail} onChange={setThumbnail} />
      </div>

      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Tags & Settings</h3>
        <div>
          <label htmlFor="job-tags" className={lbl} style={lblStyle}>Tags</label>
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
          <input id="job-tags" name="tags" autoComplete="off"
            value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag}
            placeholder="Type and press Enter" className={inp} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="job-featured" name="isFeatured" {...register('isFeatured')} />
          <span className="text-sm" style={{ color: '#374151' }}>Is Featured</span>
        </label>
        <div>
          <label htmlFor="job-publishedat" className={lbl} style={lblStyle}>Published At *</label>
          <DatePicker id="job-publishedat" selected={publishedAt} onChange={setPublishedAt}
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
