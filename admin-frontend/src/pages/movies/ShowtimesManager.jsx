import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import FormModal from '../../components/common/FormModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { moviesApi } from '../../services/api'

const inp = 'w-full px-3 py-2.5 rounded-lg text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-slate-800'
const lbl = 'block text-sm font-medium text-slate-700 mb-1'

const FORMATS = ['2D', '3D', 'IMAX', '4DX', 'Dolby']

function ShowtimeForm({ defaultValues, onSubmit, loading }) {
  const [movieName,   setMovieName]   = useState(defaultValues?.movieName   || '')
  const [movieId,     setMovieId]     = useState(defaultValues?.movieId     || '')
  const [startDate,   setStartDate]   = useState(defaultValues?.startDate   ? new Date(defaultValues.startDate) : null)
  const [endDate,     setEndDate]     = useState(defaultValues?.endDate     ? new Date(defaultValues.endDate)   : null)
  const [timings,     setTimings]     = useState(defaultValues?.timings     || [])
  const [timingInput, setTimingInput] = useState('')
  const [bookingUrl,  setBookingUrl]  = useState(defaultValues?.bookingUrl  || '')
  const [language,    setLanguage]    = useState(defaultValues?.language    || '')
  const [format,      setFormat]      = useState(defaultValues?.format      || '2D')
  const [movies,      setMovies]      = useState([])

  useEffect(() => {
    moviesApi.getAll({ limit: 200 }).then((r) => setMovies(r.data?.data || [])).catch(() => {})
  }, [])

  const addTiming = () => {
    const t = timingInput.trim()
    if (t && !timings.includes(t)) { setTimings([...timings, t]); setTimingInput('') }
  }
  const removeTiming = (i) => setTimings(timings.filter((_, idx) => idx !== i))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!movieName.trim()) { toast.error('Movie name is required'); return }
    if (timings.length === 0) { toast.error('Add at least one showtime'); return }
    onSubmit({
      movieId:    movieId || null,
      movieName:  movieName.trim(),
      startDate:  startDate ? startDate.toISOString().slice(0, 10) : null,
      endDate:    endDate   ? endDate.toISOString().slice(0, 10)   : null,
      timings,
      bookingUrl: bookingUrl.trim() || null,
      language:   language.trim()   || null,
      format,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="st-movie" className={lbl}>Movie *</label>
        <select id="st-movie" name="movie" autoComplete="off" className={inp}
          value={movieId}
          onChange={(e) => {
            const opt = e.target.options[e.target.selectedIndex]
            setMovieId(e.target.value)
            setMovieName(opt.text === 'Select movie' ? '' : opt.text)
          }}>
          <option value="">Select movie</option>
          {movies.map((m) => (
            <option key={m._id} value={m._id}>{m.movieName || m.title}</option>
          ))}
        </select>
        <div className="mt-2">
          <label htmlFor="st-moviename" className={lbl} style={{ marginTop: 0 }}>Or enter movie name manually</label>
          <input id="st-moviename" name="movieName" autoComplete="off" className={inp}
            value={movieName} onChange={(e) => setMovieName(e.target.value)} placeholder="e.g. KGF Chapter 3" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="st-startdate" className={lbl}>From Date</label>
          <DatePicker
            id="st-startdate"
            selected={startDate}
            onChange={setStartDate}
            dateFormat="dd/MM/yyyy"
            placeholderText="Start date"
            className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-300 focus:outline-none bg-white"
          />
        </div>
        <div>
          <label htmlFor="st-enddate" className={lbl}>To Date</label>
          <DatePicker
            id="st-enddate"
            selected={endDate}
            onChange={setEndDate}
            dateFormat="dd/MM/yyyy"
            placeholderText="End date"
            className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-300 focus:outline-none bg-white"
          />
        </div>
      </div>

      <div>
        <label className={lbl}>Show Timings *</label>
        <div className="flex gap-2 mb-2">
          <input
            id="st-timing-input" name="timingInput" autoComplete="off"
            value={timingInput} onChange={(e) => setTimingInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTiming() } }}
            placeholder="e.g. 10:30 AM" className={`${inp} flex-1`} />
          <button type="button" onClick={addTiming}
            className="px-3 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {timings.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {timings.map((t, i) => (
              <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                {t}
                <button type="button" onClick={() => removeTiming(i)}>
                  <X className="w-3 h-3 cursor-pointer" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="st-language" className={lbl}>Language</label>
          <input id="st-language" name="language" autoComplete="off" className={inp}
            value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. Telugu" />
        </div>
        <div>
          <label htmlFor="st-format" className={lbl}>Format</label>
          <select id="st-format" name="format" autoComplete="off" className={inp}
            value={format} onChange={(e) => setFormat(e.target.value)}>
            {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="st-booking" className={lbl}>Booking URL</label>
        <input id="st-booking" name="bookingUrl" type="url" autoComplete="url" className={inp}
          value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder="Generic booking link" />
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
        {loading ? 'Saving...' : 'Save Showtime'}
      </button>
    </form>
  )
}

export default function ShowtimesManager({ theatre, onClose }) {
  const [showtimes,      setShowtimes]      = useState([])
  const [loading,        setLoading]        = useState(true)
  const [deleteId,       setDeleteId]       = useState(null)
  const [deleting,       setDeleting]       = useState(false)
  const [formOpen,       setFormOpen]       = useState(false)
  const [formDefaults,   setFormDefaults]   = useState(null)
  const [formEditId,     setFormEditId]     = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const fetchData = () => {
    setLoading(true)
    moviesApi.getShowtimes(theatre._id)
      .then((r) => setShowtimes(r.data?.data || []))
      .catch(() => toast.error('Failed to load showtimes'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setFormDefaults({}); setFormEditId(null); setFormOpen(true) }
  const openEdit   = (s)  => { setFormDefaults(s); setFormEditId(s._id); setFormOpen(true) }

  const handleSubmit = async (data) => {
    setFormSubmitting(true)
    try {
      if (formEditId) await moviesApi.updateShowtime(formEditId, data)
      else            await moviesApi.createShowtime(theatre._id, data)
      toast.success(formEditId ? 'Showtime updated!' : 'Showtime added!')
      setFormOpen(false); fetchData()
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setFormSubmitting(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await moviesApi.deleteShowtime(deleteId); toast.success('Deleted'); setDeleteId(null); fetchData() }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Showtimes — {theatre.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{showtimes.length} showtime{showtimes.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}>
              <Plus className="w-4 h-4" /> Add Showtime
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? <LoadingSpinner /> : showtimes.length === 0 ? (
            <p className="text-center text-sm text-slate-400 italic py-8">
              No showtimes yet. Click "Add Showtime" to add one.
            </p>
          ) : (
            <div className="space-y-3">
              {showtimes.map((s) => (
                <div key={s._id} className="rounded-xl p-4 flex items-start justify-between gap-4"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-bold text-sm text-slate-800">{s.movieName}</span>
                      {s.language && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{s.language}</span>
                      )}
                      {s.format && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{s.format}</span>
                      )}
                    </div>
                    {s.timings?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {s.timings.map((t, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-lg text-xs font-bold"
                            style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>{t}</span>
                        ))}
                      </div>
                    )}
                    {(s.startDate || s.endDate) && (
                      <p className="text-xs text-slate-400">
                        {s.startDate || '—'} → {s.endDate || '—'}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(s._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Showtime"
        message="Remove this showtime entry permanently?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={formEditId ? 'Edit Showtime' : 'Add Showtime'}
        maxWidth="max-w-lg"
      >
        {formDefaults !== null && (
          <ShowtimeForm defaultValues={formDefaults} onSubmit={handleSubmit} loading={formSubmitting} />
        )}
      </FormModal>
    </div>
  )
}
