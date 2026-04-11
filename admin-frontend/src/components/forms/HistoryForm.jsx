import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, X } from 'lucide-react'
import RichTextEditor from '../common/RichTextEditor'
import ImageUpload from '../common/ImageUpload'

const lbl = 'block text-sm font-medium mb-1.5'
const lblStyle = { color: '#374151' }
const section = 'rounded-xl p-5 space-y-4'
const sectionStyle = { background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const inp = 'w-full px-3 py-2.5 rounded-lg text-sm'

export default function HistoryForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  const [description, setDescription] = useState(defaultValues?.description || '')
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')
  const [references, setReferences] = useState(defaultValues?.references || [''])

  const addReference = () => setReferences([...references, ''])
  const updateRef = (i, val) => { const r = [...references]; r[i] = val; setReferences(r) }
  const removeRef = (i) => setReferences(references.filter((_, idx) => idx !== i))

  const submit = (data) => {
    onSubmit({ ...data, description, thumbnail, references: references.filter(Boolean) })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">History Details</h3>

        <div>
          <label htmlFor="hist-title" className={lbl} style={lblStyle}>Title *</label>
          <input id="hist-title" name="title" autoComplete="off"
            {...register('title', { required: 'Required' })} className={inp} />
          {errors.title && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="hist-era" className={lbl} style={lblStyle}>Era / Period *</label>
          <input id="hist-era" name="eraPeriod" autoComplete="off"
            {...register('eraPeriod', { required: 'Required' })} placeholder="e.g. Vijayanagara Empire" className={inp} />
          {errors.eraPeriod && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.eraPeriod.message}</p>}
        </div>

        <div>
          <label className={lbl} style={lblStyle}>Description *</label>
          <RichTextEditor value={description} onChange={setDescription} />
        </div>

        <ImageUpload module="history" label="Thumbnail" value={thumbnail} onChange={setThumbnail} />

        <div>
          <label htmlFor="hist-year" className={lbl} style={lblStyle}>Year Label</label>
          <input id="hist-year" name="yearLabel" autoComplete="off"
            {...register('yearLabel')} placeholder="Shown on timeline" className={inp} />
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">References</h3>
        {references.map((ref, i) => (
          <div key={i} className="flex gap-2">
            <input value={ref} onChange={(e) => updateRef(i, e.target.value)}
              className={`${inp} flex-1`} placeholder="https://..." type="url" autoComplete="url" />
            <button type="button" onClick={() => removeRef(i)}
              className="p-2 rounded-lg text-red-400 hover:text-red-300 transition-colors"
              style={{ background: 'rgba(239,68,68,0.1)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={addReference}
          className="flex items-center gap-1 text-sm transition-colors"
          style={{ color: '#A78BFA' }}>
          <Plus className="w-4 h-4" /> Add Reference
        </button>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
