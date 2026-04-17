/**
 * TrailerForm — RULE 35 (Movies → Trailers section)
 * Fields: Movie Name, Trailer URL (YouTube), Thumbnail, Description
 */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import ImageUpload from '../common/ImageUpload'

const lbl   = 'block text-sm font-medium mb-1.5'
const lblSt = { color: '#374151' }
const sec   = 'rounded-xl p-5 space-y-4'
const secSt = { background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const inp   = 'w-full px-3 py-2.5 rounded-lg text-sm'
const inpSt = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }

export default function TrailerForm({ defaultValues, onSubmit, loading, contentId, onDirtyChange }) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({ defaultValues })
  const [thumbnail, setThumbnail] = useState(defaultValues?.thumbnail || '')

  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])

  const submit = (data) => {
    // Strip internal flag before submitting
    const { _isTrailer, ...clean } = data
    onSubmit({ ...clean, thumbnail })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={sec} style={secSt}>
        <h3 className="font-semibold text-slate-800">Trailer Details</h3>

        <div>
          <label htmlFor="trailer-moviename" className={lbl} style={lblSt}>Movie Name *</label>
          <input id="trailer-moviename" name="movieName" autoComplete="off"
            {...register('movieName', { required: 'Movie name is required' })}
            className={inp} style={inpSt} placeholder="e.g. Kalki 2898 AD" />
          {errors.movieName && <p className="text-xs mt-1 text-red-600">{errors.movieName.message}</p>}
        </div>

        <div>
          <label htmlFor="trailer-url" className={lbl} style={lblSt}>Trailer URL (YouTube) *</label>
          <input id="trailer-url" name="trailerUrl" type="url" autoComplete="url"
            {...register('trailerUrl', { required: 'Trailer URL is required' })}
            className={inp} style={inpSt} placeholder="https://youtube.com/watch?v=…" />
          {errors.trailerUrl && <p className="text-xs mt-1 text-red-600">{errors.trailerUrl.message}</p>}
        </div>

        <div>
          <label htmlFor="trailer-desc" className={lbl} style={lblSt}>Description</label>
          <textarea id="trailer-desc" name="description" autoComplete="off"
            {...register('description')} rows={3}
            className={`${inp} resize-none`} style={inpSt}
            placeholder="Brief description of the movie…" />
        </div>

        <ImageUpload
          module="movies" label="Thumbnail" value={thumbnail}
          onChange={setThumbnail} contentId={contentId} section="trailers"
        />
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
