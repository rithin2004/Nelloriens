import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Theater, Film, CalendarClock, PlayCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { moviesApi, uploadApi } from '../../services/api'
import useMoviesStore from '../../store/moviesStore'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormModal from '../../components/common/FormModal'
import MovieForm from '../../components/forms/MovieForm'
import TrailerForm from '../../components/forms/TrailerForm'
import { truncate, formatDate } from '../../utils/helpers'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../../hooks/useDebounce'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'
const PAGE_SIZE    = 20
const MAX_UPCOMING = 8

const TABS = [
  { key: 'running',  label: 'Running Now',      icon: Film          },
  { key: 'upcoming', label: 'Upcoming Movies',   icon: CalendarClock },
  { key: 'trailers', label: 'Trailers',          icon: PlayCircle    },
]

const inp = 'px-3 py-2 text-sm rounded-lg focus:outline-none transition-all'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }
const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

export default function MoviesList() {
  const navigate = useNavigate()
  const [tab,    setTab]    = useState('running')
  const [page,   setPage]   = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  // Movies/Upcoming — from Zustand (SSE-driven)
  const { items: moviesData, totalPages: moviesTotalPages, loading: moviesLoading, fetch: moviesFetch } = useMoviesStore()

  // Trailers — managed locally (separate collection, not in Zustand movies store)
  const [trailersData,       setTrailersData]       = useState([])
  const [trailersTotalPages, setTrailersTotalPages] = useState(1)
  const [trailersLoading,    setTrailersLoading]    = useState(false)

  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  // distinguish whether deleting a movie or trailer
  const [deleteType, setDeleteType] = useState('movie')

  const [formOpen,       setFormOpen]       = useState(false)
  const [formDefaults,   setFormDefaults]   = useState(null)
  const [formEditId,     setFormEditId]     = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching,   setFormFetching]   = useState(false)
  const [formDirty,      setFormDirty]      = useState(false)
  const [reservedId,     setReservedId]     = useState(null)

  // Fetch movies/upcoming
  useEffect(() => {
    if (tab === 'running' || tab === 'upcoming') {
      moviesFetch({ page, limit: PAGE_SIZE, search: debouncedSearch, status: tab === 'upcoming' ? 'coming_soon' : 'now_showing' })
    }
  }, [tab, page, debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch trailers
  const fetchTrailers = async () => {
    setTrailersLoading(true)
    try {
      const r = await moviesApi.getTrailers({ page, limit: PAGE_SIZE, search: debouncedSearch })
      setTrailersData(r.data?.items || r.data || [])
      setTrailersTotalPages(r.data?.totalPages || 1)
    } catch { toast.error('Failed to load trailers') }
    finally { setTrailersLoading(false) }
  }

  useEffect(() => {
    if (tab === 'trailers') fetchTrailers()
  }, [tab, page, debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = (t) => { setTab(t); setPage(1); setSearch('') }

  // Movie delete
  const openMovieDelete = (id) => { setDeleteType('movie'); setDeleteId(id) }
  const openTrailerDelete = (id) => { setDeleteType('trailer'); setDeleteId(id) }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      if (deleteType === 'trailer') {
        await moviesApi.deleteTrailer(deleteId)
        toast.success('Trailer deleted')
        fetchTrailers()
      } else {
        await moviesApi.delete(deleteId)
        toast.success('Moved to Recycle Bin')
      }
      setDeleteId(null)
    } catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreateMovie = async () => {
    setFormEditId(null); setFormDirty(false)
    try { const r = await uploadApi.reserveId('MOV'); setReservedId(r.data.data.id) }
    catch { toast.error('Failed to reserve ID'); return }
    setFormDefaults({}); setFormOpen(true)
  }

  const openCreateTrailer = async () => {
    setFormEditId(null); setFormDirty(false)
    try { const r = await uploadApi.reserveId('MOV'); setReservedId(r.data.data.id) }
    catch { toast.error('Failed to reserve ID'); return }
    setFormDefaults({ _isTrailer: true }); setFormOpen(true)
  }

  const openEditMovie = async (id) => {
    setFormFetching(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false); setFormOpen(true)
    try { const r = await moviesApi.getById(id); setFormDefaults(r.data) }
    catch { toast.error('Failed to load'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const openEditTrailer = async (id) => {
    setFormFetching(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false); setFormOpen(true)
    try { const r = await moviesApi.getTrailerById(id); setFormDefaults({ ...r.data, _isTrailer: true }) }
    catch { toast.error('Failed to load'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (data) => {
    setFormSubmitting(true)
    const isTrailer = formDefaults?._isTrailer
    try {
      if (isTrailer) {
        if (formEditId) { await moviesApi.updateTrailer(formEditId, data); toast.success('Trailer updated!') }
        else            { await moviesApi.createTrailer(reservedId ? { ...data, _reservedId: reservedId } : data); toast.success('Trailer added!') }
        fetchTrailers()
      } else {
        if (formEditId) { await moviesApi.update(formEditId, data); toast.success('Updated!') }
        else            { await moviesApi.create(reservedId ? { ...data, _reservedId: reservedId } : data); toast.success('Created!') }
      }
      setFormOpen(false); setFormDirty(false); setReservedId(null)
    } catch (e) {
      // RULE 35 — max 8 upcoming
      if (e?.response?.data?.code === 'MAX_LIMIT_REACHED') {
        toast.error('Maximum 8 upcoming movies reached. Remove one first.')
      } else {
        toast.error(e?.response?.data?.message || 'Save failed')
      }
    }
    finally { setFormSubmitting(false) }
  }

  const handleCloseForm = () => {
    if (formDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return
    setFormOpen(false); setFormDirty(false); setReservedId(null)
  }

  const movieActionBtns = (row) => (
    <div className="flex gap-1">
      <button onClick={() => openEditMovie(row.original._id)}
        className="p-1.5 rounded-lg text-slate-400 transition-colors"
        onMouseEnter={(e) => { e.currentTarget.style.color = P; e.currentTarget.style.background = PB }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
        <Pencil className="w-4 h-4" />
      </button>
      <button onClick={() => openMovieDelete(row.original._id)}
        className="p-1.5 rounded-lg text-slate-400 transition-colors"
        onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEE2E2' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )

  const trailerActionBtns = (row) => (
    <div className="flex gap-1">
      <button onClick={() => openEditTrailer(row.original._id)}
        className="p-1.5 rounded-lg text-slate-400 transition-colors"
        onMouseEnter={(e) => { e.currentTarget.style.color = P; e.currentTarget.style.background = PB }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
        <Pencil className="w-4 h-4" />
      </button>
      <button onClick={() => openTrailerDelete(row.original._id)}
        className="p-1.5 rounded-lg text-slate-400 transition-colors"
        onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEE2E2' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )

  const upcomingColumns = [
    {
      accessorKey: 'poster', header: '',
      cell: ({ row }) => row.original.poster
        ? <img src={row.original.poster} className="w-10 h-14 object-cover rounded-lg" alt="" />
        : <div className="w-10 h-14 rounded-lg" style={{ background: '#F1F5F9' }} />,
    },
    { accessorKey: 'movieName', header: 'Movie', cell: ({ getValue }) => <span className="font-semibold text-slate-800">{truncate(getValue() || '', 50)}</span> },
    { accessorKey: 'language',  header: 'Language', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    { accessorKey: 'genre',     header: 'Genre',    cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    {
      accessorKey: 'runningFrom', header: 'Release',
      cell: ({ getValue }) => !getValue()
        ? <span className="text-slate-400 text-xs">TBA</span>
        : <span className="text-slate-600 text-xs font-medium">{new Date(getValue()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>,
    },
    {
      accessorKey: 'trailerUrl', header: 'Trailer',
      cell: ({ getValue }) => getValue()
        ? <a href={getValue()} target="_blank" rel="noreferrer" className="text-xs hover:underline" style={{ color: P }}>Watch ↗</a>
        : <span className="text-slate-300 text-xs">—</span>,
    },
    { id: 'actions', header: '', cell: ({ row }) => movieActionBtns(row) },
  ]

  const runningColumns = [
    {
      accessorKey: 'poster', header: '',
      cell: ({ row }) => row.original.poster
        ? <img src={row.original.poster} className="w-10 h-14 object-cover rounded-lg" alt="" />
        : <div className="w-10 h-14 rounded-lg" style={{ background: '#F1F5F9' }} />,
    },
    { accessorKey: 'movieName', header: 'Movie', cell: ({ getValue }) => <span className="font-semibold text-slate-800">{truncate(getValue() || '', 40)}</span> },
    { accessorKey: 'language',  header: 'Language', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    {
      accessorKey: 'theatre', header: 'Theatre',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-xs font-medium text-slate-700">
          <Theater className="w-3 h-3 text-purple-400 shrink-0" />
          {row.original.theatre?.name || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'showTimings', header: 'Show Timings',
      cell: ({ getValue }) => {
        const timings = getValue() || []
        if (!timings.length) return <span className="text-slate-300 text-xs">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {timings.map((t, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: '#EDE9FE', color: '#6D28D9' }}>{t}</span>
            ))}
          </div>
        )
      },
    },
    { id: 'actions', header: '', cell: ({ row }) => movieActionBtns(row) },
  ]

  const trailerColumns = [
    {
      accessorKey: 'thumbnail', header: '',
      cell: ({ row }) => row.original.thumbnail
        ? <img src={row.original.thumbnail} className="w-16 h-10 object-cover rounded-lg" alt="" />
        : <div className="w-16 h-10 rounded-lg flex items-center justify-center" style={{ background: '#1e1e1e' }}><PlayCircle className="w-5 h-5 text-slate-500" /></div>,
    },
    { accessorKey: 'movieName', header: 'Movie Name', cell: ({ getValue }) => <span className="font-semibold text-slate-800">{truncate(getValue() || '', 50)}</span> },
    {
      accessorKey: 'trailerUrl', header: 'Trailer URL',
      cell: ({ getValue }) => getValue()
        ? <a href={getValue()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs hover:underline" style={{ color: '#DC2626' }}><PlayCircle className="w-3.5 h-3.5" /> Watch</a>
        : <span className="text-slate-300 text-xs">—</span>,
    },
    { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{truncate(getValue() || '', 40)}</span> },
    { accessorKey: 'createdAt',   header: 'Added',       cell: ({ getValue }) => <span className="text-slate-500 text-xs">{formatDate(getValue())}</span> },
    { id: 'actions', header: '', cell: ({ row }) => trailerActionBtns(row) },
  ]

  const isTrailerForm = formDefaults?._isTrailer

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Movies"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/movies/theatres')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all"
              style={{ background: PL, border: `1px solid ${PL}`, color: P }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#c8dafd'}
              onMouseLeave={(e) => e.currentTarget.style.background = PL}
            >
              <Theater className="w-4 h-4" /> Theatres
            </button>
            <button
              onClick={tab === 'trailers' ? openCreateTrailer : openCreateMovie}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}
            >
              <Plus className="w-4 h-4" /> {tab === 'trailers' ? 'Add Trailer' : 'Add Movie'}
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: PL }}>
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => switchTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-all"
              style={tab === t.key
                ? { background: '#FFFFFF', color: P, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { background: 'transparent', color: '#64748B' }}>
              <Icon className="w-3.5 h-3.5" />{t.label}
            </button>
          )
        })}
      </div>

      {/* Info banners */}
      {tab === 'upcoming' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: '#EDE9FE', border: '1px solid #DDD6FE', color: '#6D28D9' }}>
          <CalendarClock className="w-3.5 h-3.5 shrink-0" />
          <span>Upcoming / Coming Soon movies — max <strong>{MAX_UPCOMING}</strong> shown on user side.</span>
        </div>
      )}
      {tab === 'running' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: PB, border: `1px solid ${PL}`, color: P }}>
          <Film className="w-3.5 h-3.5 shrink-0" />
          <span>Currently running movies with theatre and booking links.</span>
        </div>
      )}
      {tab === 'trailers' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: '#FFF1F2', border: '1px solid #FECDD3', color: '#BE123C' }}>
          <PlayCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Movie trailers — add YouTube trailer links with thumbnails.</span>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <div>
          <label htmlFor="search-movies" className="sr-only">Search</label>
          <input id="search-movies" name="search" autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search…"
            className={`${inp} w-56`}
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          />
        </div>
      </div>

      {/* Tables */}
      {tab === 'running' && (
        <DataTable columns={runningColumns} data={moviesData} isLoading={moviesLoading}
          page={page} totalPages={moviesTotalPages} onPageChange={setPage} />
      )}
      {tab === 'upcoming' && (
        <DataTable columns={upcomingColumns} data={moviesData} isLoading={moviesLoading}
          page={page} totalPages={moviesTotalPages} onPageChange={setPage} />
      )}
      {tab === 'trailers' && (
        <DataTable columns={trailerColumns} data={trailersData} isLoading={trailersLoading}
          page={page} totalPages={trailersTotalPages} onPageChange={setPage} />
      )}

      <div className="flex items-center gap-4 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400"><Info className="w-3 h-3" /><span>Row actions:</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Pencil className="w-3 h-3" style={{ color: P }} /><span>Edit</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Trash2 className="w-3 h-3 text-red-400" /><span>Delete</span></div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title={deleteType === 'trailer' ? 'Delete Trailer' : 'Delete Movie'}
        message={deleteType === 'trailer' ? 'This will permanently delete the trailer.' : 'This will move the movie to the Recycle Bin. You can restore it within 15 days.'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      <FormModal isOpen={formOpen} onClose={handleCloseForm}
        title={formEditId ? (isTrailerForm ? 'Edit Trailer' : 'Edit Movie') : (isTrailerForm ? 'Add Trailer' : 'Add Movie')}
        maxWidth="max-w-2xl">
        {(formFetching || formDefaults === null) ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
          </div>
        ) : isTrailerForm ? (
          <TrailerForm defaultValues={formDefaults} onSubmit={handleFormSubmit} loading={formSubmitting}
            onDirtyChange={setFormDirty} contentId={formEditId || reservedId} />
        ) : (
          <MovieForm defaultValues={formDefaults} onSubmit={handleFormSubmit} loading={formSubmitting}
            onDirtyChange={setFormDirty} contentId={formEditId || reservedId} />
        )}
      </FormModal>
    </div>
  )
}
