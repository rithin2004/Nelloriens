import { useForm } from 'react-hook-form'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useState } from 'react'

const field = 'block text-sm font-medium text-slate-700 mb-1'
const input = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

const PLACEMENTS = ['news_top', 'news_sidebar', 'jobs_sidebar', 'home_banner', 'home_sidebar', 'results_top', 'sports_top', 'events_top']

export default function AdForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit } = useForm({ defaultValues })
  const [validFrom, setValidFrom] = useState(defaultValues?.validFrom ? new Date(defaultValues.validFrom) : null)
  const [validUntil, setValidUntil] = useState(defaultValues?.validUntil ? new Date(defaultValues.validUntil) : null)

  const submit = (data) => {
    onSubmit({ ...data, validFrom: validFrom?.toISOString(), validUntil: validUntil?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        <div><label className={field}>Ad Title (Internal Label) *</label><input {...register('title', { required: true })} className={input} /></div>
        <div>
          <label className={field}>Placement *</label>
          <select {...register('placement', { required: true })} className={input}>
            <option value="">Select placement</option>
            {PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={field}>AdSense Code *</label>
          <textarea {...register('adsenseCode', { required: true })} rows={6} className={`${input} font-mono text-xs`} placeholder="Paste Google AdSense slot HTML/JS here" />
        </div>
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
        <div><label className={field}>Priority</label><input {...register('priority')} type="number" className={input} placeholder="Higher = shown first" /></div>
        <div>
          <label className={field}>Status *</label>
          <select {...register('status', { required: true })} className={input}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
