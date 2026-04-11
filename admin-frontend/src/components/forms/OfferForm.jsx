import { useState } from 'react'
import { useForm } from 'react-hook-form'
import ImageUpload from '../common/ImageUpload'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const field = 'block text-sm font-medium text-slate-700 mb-1'
const input = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

export default function OfferForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit } = useForm({ defaultValues })
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  const [validFrom, setValidFrom] = useState(defaultValues?.validFrom ? new Date(defaultValues.validFrom) : null)
  const [validUntil, setValidUntil] = useState(defaultValues?.validUntil ? new Date(defaultValues.validUntil) : null)

  const submit = (data) => {
    onSubmit({ ...data, thumbnail, validFrom: validFrom?.toISOString(), validUntil: validUntil?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        <h3 className="font-semibold text-slate-800">Offer Details</h3>
        <div><label className={field}>Offer Title *</label><input {...register('title', { required: true })} className={input} /></div>
        <div><label className={field}>Business Name *</label><input {...register('businessName', { required: true })} className={input} /></div>
        <div>
          <label className={field}>Category *</label>
          <select {...register('category', { required: true })} className={input}>
            <option value="">Select</option>
            {['Food', 'Shopping', 'Medical', 'Education', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <ImageUpload module="offers" label="Thumbnail *" value={thumbnail} onChange={setThumbnail} />
        <div><label className={field}>Description *</label><textarea {...register('description', { required: true })} rows={3} className={input} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={field}>Valid From *</label>
            <DatePicker selected={validFrom} onChange={setValidFrom} dateFormat="dd/MM/yyyy" className={input} />
          </div>
          <div>
            <label className={field}>Valid Until *</label>
            <DatePicker selected={validUntil} onChange={setValidUntil} dateFormat="dd/MM/yyyy" minDate={validFrom} className={input} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={field}>Discount %</label><input {...register('discountPercent')} type="number" min="0" max="100" className={input} /></div>
          <div><label className={field}>Coupon Code</label><input {...register('couponCode')} className={input} /></div>
        </div>
        <div><label className={field}>Redirect URL</label><input {...register('redirectUrl')} type="url" className={input} /></div>
        <div><label className={field}>Contact Phone</label><input {...register('contactPhone')} className={input} /></div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 accent-purple-600" />
          <span className="text-sm text-slate-700">Is Featured</span>
        </label>
      </div>

      <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
