import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import ImageUpload from '../common/ImageUpload'
import InlineCategoryAdd from '../common/InlineCategoryAdd'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { updatesApi } from '../../services/api'

const field = 'block text-sm font-medium text-slate-700 mb-1'
const input = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

export default function UpdateForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit } = useForm({ defaultValues })
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  // Store as local Date; we convert to IST ISO on submit
  const [dateTime, setDateTime] = useState(defaultValues?.validUntil ? new Date(defaultValues.validUntil) : null)
  const [categories, setCategories] = useState([])

  const fetchCategories = () => updatesApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  useEffect(() => { fetchCategories() }, [])

  const submit = (data) => {
    onSubmit({ ...data, thumbnail, validUntil: dateTime?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        <div><label className={field}>Title *</label><input {...register('title', { required: true })} className={input} /></div>
        <div><label className={field}>Message *</label><textarea {...register('message', { required: true })} rows={4} className={input} /></div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className={field} style={{ marginBottom: 0 }}>Category</label>
            <InlineCategoryAdd
              label="Category"
              placeholder="e.g. Government"
              onAdd={async (name) => { await updatesApi.createCategory({ name }); await fetchCategories() }}
            />
          </div>
          <select {...register('category')} className={input}>
            <option value="">No category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={field}>Update Type *</label>
          <select {...register('updateType', { required: true })} className={input}>
            <option value="banner">Banner</option>
            <option value="popup">Popup</option>
            <option value="ticker">Ticker</option>
            <option value="push_notification">Push Notification</option>
          </select>
        </div>
        <div><label className={field}>Redirect URL</label><input {...register('redirectUrl')} type="url" className={input} /></div>
        <ImageUpload module="updates" label="Thumbnail" value={thumbnail} onChange={setThumbnail} />
        <div>
          <label className={field}>
            Date &amp; Time
            <span className="ml-1.5 text-xs font-normal text-slate-400">(IST — India Standard Time)</span>
          </label>
          <DatePicker
            selected={dateTime}
            onChange={setDateTime}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="Time (IST)"
            dateFormat="dd/MM/yyyy HH:mm"
            placeholderText="Select date &amp; time (IST)"
            className={input}
            isClearable
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
