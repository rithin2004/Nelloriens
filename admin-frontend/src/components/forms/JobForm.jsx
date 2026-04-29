import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
          style={{ background: logo ? 'transparent' : (companyName?.trim() ? color : '#E2E8F0'), border: '1px solid #E2E8F0' }}>
          {logo
            ? <img src={logo} alt="logo" className="w-full h-full object-cover" />
            : companyName?.trim()
              ? <span className="text-white font-bold text-lg">{initial}</span>
              : <span className="text-slate-400 font-bold text-lg">?</span>
          }
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <input
            id="job-company-logo"
            name="companyLogo"
            type="url"
            placeholder="Paste logo URL"
            autoComplete="url"
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

function ToggleSwitch({ id, checked, onChange, label }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-semibold text-slate-500">{label}</span>}
      <button type="button" role="switch" aria-checked={checked} id={id}
        onClick={() => onChange(!checked)}
        className="relative inline-flex items-center rounded-full transition-colors w-10 h-6 shrink-0"
        style={{ background: checked ? '#10B981' : '#D1D5DB' }}>
        <span className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
    </div>
  )
}

export default function JobForm({ defaultValues, onSubmit, loading, contentId }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues })
  const companyNameVal = watch('companyName', defaultValues?.companyName || '')
  const [isVerified, setIsVerified] = useState(defaultValues?.isVerified || false)
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [description, setDescription] = useState(defaultValues?.fullDescription || '')
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  const [companyLogo, setCompanyLogo] = useState(defaultValues?.companyLogo || '')
  const [lastDate, setLastDate] = useState(defaultValues?.lastDate ? new Date(defaultValues.lastDate) : null)
  const [publishedAt, setPublishedAt] = useState(defaultValues?.publishedAt ? new Date(defaultValues.publishedAt) : new Date())

  const [jobTypes,   setJobTypes]   = useState([])

  const fetchCategories = () => jobsApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
  const fetchLocations  = () => jobsApi.getLocations().then((r)  => setLocations(r.data.data  || [])).catch(() => {})
  const fetchTypes      = () => jobsApi.getTypes().then((r)       => setJobTypes(r.data.data   || [])).catch(() => {})

  useEffect(() => { fetchCategories(); fetchLocations(); fetchTypes() }, [])

  const submit = (data) => {
    onSubmit({ ...data, fullDescription: description, thumbnail, companyLogo, isVerified, lastDate: lastDate?.toISOString(), publishedAt: publishedAt?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section} style={sectionStyle}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Job Details</h3>
          <ToggleSwitch id="job-verified" checked={isVerified} onChange={setIsVerified} label="Verified" />
        </div>

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
            {errors.companyName && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.companyName.message}</p>}
          </div>
          <CompanyLogoField logo={companyLogo} onChange={setCompanyLogo} companyName={companyNameVal} />
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
            <select id="job-category" name="category" autoComplete="off"
              {...register('category', { required: 'Required' })} className={inp}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {errors.category && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.category.message}</p>}
          </div>

          <div>
            <label htmlFor="job-exptype" className={lbl} style={lblStyle}>Experience Type *</label>
            <select id="job-exptype" name="experienceType" autoComplete="off"
              {...register('experienceType', { required: 'Required' })} className={inp}>
              <option value="">Select</option>
              <option value="fresher">Fresher</option>
              <option value="experienced">Experienced</option>
              <option value="both">Both</option>
            </select>
            {errors.experienceType && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.experienceType.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="job-type" className={lbl} style={lblStyle}>Job Type</label>
            <select id="job-type" name="jobType" autoComplete="off" {...register('jobType')} className={inp}>
              <option value="">Select type</option>
              {jobTypes.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="job-workmode" className={lbl} style={lblStyle}>Work Mode</label>
            <select id="job-workmode" name="workMode" autoComplete="off" {...register('workMode')} className={inp}>
              <option value="">Select</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
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
          <select id="job-location" name="location" autoComplete="off"
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
          {errors.shortDescription && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.shortDescription.message}</p>}
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
          <p className={lbl} style={lblStyle}>Full Description</p>
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
        <ImageUpload module="jobs" label="Thumbnail" value={thumbnail} onChange={setThumbnail} contentId={contentId} section="thumbnails" />
      </div>

      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Publish Settings</h3>
        <div>
          <label htmlFor="job-publishedat" className={lbl} style={lblStyle}>Published At *</label>
          <DatePicker id="job-publishedat" selected={publishedAt} onChange={setPublishedAt}
            showTimeSelect dateFormat="dd/MM/yyyy HH:mm" className="w-full" />
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Location & Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="job-scope" className={lbl} style={lblStyle}>Scope *</label>
            <select id="job-scope" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={inp}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="job-city" className={lbl} style={lblStyle}>City</label>
            <input id="job-city" name="city" autoComplete="address-level2"
              {...register('city')} className={inp} />
          </div>
        </div>
        <div>
          <label htmlFor="job-region" className={lbl} style={lblStyle}>Region</label>
          <input id="job-region" name="region" autoComplete="off"
            {...register('region')} className={inp} />
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
