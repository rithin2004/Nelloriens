import { useState } from 'react'
import { useForm } from 'react-hook-form'
import ImageUpload from '../common/ImageUpload'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const field = 'block text-sm font-medium text-slate-700 mb-1'
const input = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

const PAGES = ['home', 'news', 'jobs', 'results', 'sports', 'foods', 'events', 'movies', 'tourism']

export default function SponsorForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit } = useForm({ defaultValues })
  const [logo, setLogo] = useState(defaultValues?.logo || '')
  const [validFrom, setValidFrom] = useState(defaultValues?.validFrom ? new Date(defaultValues.validFrom) : null)
  const [validUntil, setValidUntil] = useState(defaultValues?.validUntil ? new Date(defaultValues.validUntil) : null)

  const submit = (data) => {
    onSubmit({ ...data, logo, validFrom: validFrom?.toISOString(), validUntil: validUntil?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        <div><label className={field}>Sponsor Name *</label><input {...register('sponsorName', { required: true })} className={input} /></div>
        <ImageUpload module="sponsorships" label="Logo *" value={logo} onChange={setLogo} />
        <div>
          <label className={field}>Sponsor Type *</label>
          <select {...register('sponsorType', { required: true })} className={input}>
            <option value="">Select</option>
            {['Gold', 'Silver', 'Bronze', 'Title', 'Event'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div><label className={field}>Website URL</label><input {...register('websiteUrl')} type="url" className={input} /></div>
        <div><label className={field}>Description</label><textarea {...register('description')} rows={3} className={input} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={field}>Valid From</label>
            <DatePicker selected={validFrom} onChange={setValidFrom} dateFormat="dd/MM/yyyy" className={input} isClearable />
          </div>
          <div>
            <label className={field}>Valid Until</label>
            <DatePicker selected={validUntil} onChange={setValidUntil} dateFormat="dd/MM/yyyy" minDate={validFrom} className={input} isClearable />
          </div>
        </div>
        <div><label className={field}>Display Order</label><input {...register('displayOrder')} type="number" className={input} /></div>
        <div>
          <label className={field}>Placement Pages</label>
          <div className="flex flex-wrap gap-3 mt-1">
            {PAGES.map((p) => (
              <label key={p} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700 capitalize">
                <input type="checkbox" value={p} {...register('placementPages')} className="w-4 h-4 accent-purple-600" />
                {p}
              </label>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
