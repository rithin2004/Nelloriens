import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import ImageUpload from '../common/ImageUpload'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const field = 'block text-sm font-medium text-slate-700 mb-1'
const input = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

const PAGES = ['home', 'news', 'jobs', 'results', 'sports', 'foods', 'events', 'movies', 'tourism']

export default function SponsorForm({ defaultValues, onSubmit, loading, contentId, onDirtyChange }) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({ defaultValues })
  const [logo, setLogo] = useState(defaultValues?.logo || '')
  const [validFrom, setValidFrom] = useState(defaultValues?.validFrom ? new Date(defaultValues.validFrom) : null)
  const [validUntil, setValidUntil] = useState(defaultValues?.validUntil ? new Date(defaultValues.validUntil) : null)

  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])

  const submit = (data) => {
    if (!logo) { toast.error('Logo is required'); return }
    onSubmit({ ...data, logo, validFrom: validFrom?.toISOString(), validUntil: validUntil?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        <div>
          <label htmlFor="spn-name" className={field}>Sponsor Name *</label>
          <input id="spn-name" name="sponsorName" autoComplete="organization" {...register('sponsorName', { required: 'Required' })} className={input} />
          {errors.sponsorName && <p className="text-xs mt-1 text-red-600">{errors.sponsorName.message}</p>}
        </div>
        <ImageUpload module="sponsorships" label="Logo *" value={logo} onChange={setLogo} contentId={contentId} section="logos" />
        <div>
          <label htmlFor="spn-type" className={field}>Sponsor Type *</label>
          <select id="spn-type" name="sponsorType" autoComplete="off" {...register('sponsorType', { required: true })} className={input}>
            <option value="">Select</option>
            {['Gold', 'Silver', 'Bronze', 'Title', 'Event'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="spn-website" className={field}>Website URL</label>
          <input id="spn-website" name="websiteUrl" type="url" autoComplete="url" {...register('websiteUrl')} className={input} />
        </div>
        <div>
          <label htmlFor="spn-description" className={field}>Description</label>
          <textarea id="spn-description" name="description" autoComplete="off" {...register('description')} rows={3} className={input} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="spn-valid-from" className={field}>Valid From</label>
            <DatePicker id="spn-valid-from" name="validFrom" selected={validFrom} onChange={setValidFrom} dateFormat="dd/MM/yyyy" className={input} isClearable />
          </div>
          <div>
            <label htmlFor="spn-valid-until" className={field}>Valid Until</label>
            <DatePicker id="spn-valid-until" name="validUntil" selected={validUntil} onChange={setValidUntil} dateFormat="dd/MM/yyyy" minDate={validFrom} className={input} isClearable />
          </div>
        </div>
        <div>
          <label htmlFor="spn-display-order" className={field}>Display Order</label>
          <input id="spn-display-order" name="displayOrder" autoComplete="off" {...register('displayOrder')} type="number" className={input} />
        </div>
        <div>
          <p className={field}>Placement Pages</p>
          <div className="flex flex-wrap gap-3 mt-1">
            {PAGES.map((p) => (
              <label key={p} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700 capitalize">
                <input type="checkbox" id={`spn-page-${p}`} value={p} {...register('placementPages')} className="w-4 h-4 accent-purple-600" />
                {p}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location & Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="spn-scope" className={field}>Scope *</label>
            <select id="spn-scope" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={input}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="spn-city" className={field}>City</label>
            <input id="spn-city" name="city" autoComplete="address-level2"
              {...register('city')} className={input} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="spn-location" className={field}>Location</label>
            <input id="spn-location" name="location" autoComplete="off"
              {...register('location')} className={input} />
          </div>
          <div>
            <label htmlFor="spn-region" className={field}>Region</label>
            <input id="spn-region" name="region" autoComplete="off"
              {...register('region')} className={input} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
