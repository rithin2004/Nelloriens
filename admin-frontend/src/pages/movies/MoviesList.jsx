import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Theater, Film, CalendarClock, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { moviesApi, uploadApi } from '../../services/api'
import useMoviesStore from '../../store/moviesStore'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormModal from '../../components/common/FormModal'
import MovieForm from '../../components/forms/MovieForm'
import { truncate } from '../../utils/helpers'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../../hooks/useDebounce'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'
const PAGE_SIZE    = 20
const MAX_UPCOMING = 8

const TABS = [
  { key: 'running',  label: 'Running Now',    icon: Film          },
  { key: 'upcoming', label: 'Upcoming Movies', icon: CalendarClock },
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

  const { items: moviesData, totalPages: moviesTotalPages, loading: moviesLoading, fetch: moviesFetch } = useMoviesStore()

  const [deleteId,       setDeleteId]       = useState(null)
  const [deleting,       setDeleting]       = useState(false)
  const [formOpen,       setFormOpen]       = useState(false)
  const [formDefaults,   setFormDefaults]   = useState(null)
  const [formEditId,     setFormEditId]     = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching,   setFormFetching]   = useState(false)
  const [formDirty,      setFormDirty]      = useState(false)
  const [reservedId,     setReservedId]     = useState(null)

  useEffect(() => {
    moviesFetch({ page, limit: PAGE_SIZE, search: debouncedSearch, status: tab === 'upcoming' ? 'coming_soon' : 'now_showing' })
  }, [tab, page, debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = (t) => { setTab(t); setPage(1); setSearch('') }

  const handleDelete = async () => {
    setDeleting(true)
    try { await moviesApi.delete(deleteId); toast.success('Moved to Recycle Bin'); setDeleteId(null); moviesFetch() }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreateMovie = async () => {
    setFormEditId(null); setFormDirty(false)
    try { const r = await uploadApi.reserveId('MOV'); setReservedId(r.data.data.id) }
    catch { toast.error('Failed to reserve ID'); return }
    setFormDefaults({}); setFormOpen(true)
  }

  const openEditMovie = async (id) => {
    setFormFetching(true); setFormDefaults(null); setFormEditId(id); setFormDirty(false); setFormOpen(true)
    try { const r = await moviesApi.getById(id); setFormDefaults(r.data.data) }
    catch { toast.error('Failed to load'); setFormOpen(false) }
    finally { setFormFetching(false) }
  }

  const handleFormSubmit = async (data) => {
    setFormSubmitting(true)
    try {
      if (formEditId) { await moviesApi.update(formEditId, data); toast.success('Updated!') }
      else            { await moviesApi.create(reservedId ? { ...data, _reservedId: reservedId } : data); toast.success('Created!') }
      setFormOpen(false); setFormDirty(false); setReservedId(null)
      moviesFetch()
    } catch (e) {
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

  const actionBtns = (row) => (
    <div className="flex gap-1">
      <button onClick={() => openEditMovie(row.original._id)}
        className="p-1.5 rounded-lg text-slate-400 transition-colors"
        onMouseEnter={(e) => { e.currentTarget.style.color = P; e.currentTarget.style.background = PB }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
        <Pencil className="w-4 h-4" />
      </button>
      <button onClick={() => setDeleteId(row.original._id)}
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
    { accessorKey: 'movieName', header: 'Movie',    cell: ({ getValue }) => <span className="font-semibold text-slate-800">{truncate(getValue() || '', 50)}</span> },
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
    { id: 'actions', header: '', cell: ({ row }) => actionBtns(row) },
  ]

  const runningColumns = [
    {
      accessorKey: 'poster', header: '',
      cell: ({ row }) => row.original.poster
        ? <img src={row.original.poster} className="w-10 h-14 object-cover rounded-lg" alt="" />
        : <div className="w-10 h-14 rounded-lg" style={{ background: '#F1F5F9' }} />,
    },
    { accessorKey: 'movieName', header: 'Movie',    cell: ({ getValue }) => <span className="font-semibold text-slate-800">{truncate(getValue() || '', 40)}</span> },
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
    {
      accessorKey: 'trailerUrl', header: 'Trailer',
      cell: ({ getValue }) => getValue()
        ? <a href={getValue()} target="_blank" rel="noreferrer" className="text-xs hover:underline" style={{ color: P }}>Watch ↗</a>
        : <span className="text-slate-300 text-xs">—</span>,
    },
    { id: 'actions', header: '', cell: ({ row }) => actionBtns(row) },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Movies"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/movies/manage')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all"
              style={{ background: PL, border: `1px solid ${PL}`, color: P }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#c8dafd'}
              onMouseLeave={(e) => e.currentTarget.style.background = PL}
            >
              <Theater className="w-4 h-4" /> Theatres
            </button>
            <button
              onClick={openCreateMovie}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}
            >
              <Plus className="w-4 h-4" /> Add Movie
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

      {tab === 'upcoming' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: '#EDE9FE', border: '1px solid #DDD6FE', color: '#6D28D9' }}>
          <CalendarClock className="w-3.5 h-3.5 shrink-0" />
          <span>Upcoming / Coming Soon movies — max <strong>{MAX_UPCOMING}</strong> shown on user side. Trailer URL is set per movie.</span>
        </div>
      )}
      {tab === 'running' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: PB, border: `1px solid ${PL}`, color: P }}>
          <Film className="w-3.5 h-3.5 shrink-0" />
          <span>Currently running movies with theatre, show timings, and booking links. Trailer URL is set per movie.</span>
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

      <DataTable
        columns={tab === 'upcoming' ? upcomingColumns : runningColumns}
        data={moviesData}
        isLoading={moviesLoading}
        page={page}
        totalPages={moviesTotalPages}
        onPageChange={setPage}
      />

      <div className="flex items-center gap-4 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400"><Info className="w-3 h-3" /><span>Row actions:</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Pencil className="w-3 h-3" style={{ color: P }} /><span>Edit</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Trash2 className="w-3 h-3 text-red-400" /><span>Delete (moves to Recycle Bin)</span></div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Movie"
        message="This will move the movie to the Recycle Bin. You can restore it within 15 days."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      <FormModal isOpen={formOpen} onClose={handleCloseForm}
        title={formEditId ? 'Edit Movie' : 'Add Movie'}
        maxWidth="max-w-2xl">
        {(formFetching || formDefaults === null) ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
          </div>
        ) : (
          <MovieForm defaultValues={formDefaults} onSubmit={handleFormSubmit} loading={formSubmitting}
            onDirtyChange={setFormDirty} contentId={formEditId || reservedId} />
        )}
      </FormModal>
    </div>
  )
}
