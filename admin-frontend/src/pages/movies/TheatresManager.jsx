import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, Info, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import FormModal from '../../components/common/FormModal'
import TheatreForm from '../../components/forms/TheatreForm'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ShowtimesManager from './ShowtimesManager'
import { moviesApi } from '../../services/api'

export default function TheatresManager({ hideHeader = false }) {
  const [theatres, setTheatres] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Form modal
  const [formOpen, setFormOpen] = useState(false)
  const [formDefaults, setFormDefaults] = useState(null)
  const [formEditId, setFormEditId] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [showtimesTheatre, setShowtimesTheatre] = useState(null)

  const fetchData = () => {
    setLoading(true)
    moviesApi.getTheatres()
      .then((r) => setTheatres(r.data?.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setFormDefaults({})
    setFormEditId(null)
    setFormOpen(true)
  }

  const openEdit = (theatre) => {
    setFormDefaults(theatre)
    setFormEditId(theatre._id)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data) => {
    setFormSubmitting(true)
    try {
      if (formEditId) {
        await moviesApi.updateTheatre(formEditId, data)
        toast.success('Theatre updated!')
      } else {
        await moviesApi.createTheatre(data)
        toast.success('Theatre added!')
      }
      setFormOpen(false)
      fetchData()
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Save failed')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await moviesApi.deleteTheatre(deleteId); toast.success('Deleted'); setDeleteId(null); fetchData() }
    catch (e) { toast.error(e.message) }
    finally { setDeleting(false) }
  }

  return (
    <div className={hideHeader ? '' : 'animate-fade-in'}>
      {!hideHeader && (
        <PageHeader
          title="Theatres"
          backTo="/movies"
          action={
            <button
              onClick={openCreate}
              className="btn-shine flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}
            >
              <Plus className="w-4 h-4" /> Add Theatre
            </button>
          }
        />
      )}
      {hideHeader && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500">{theatres.length} {theatres.length === 1 ? 'theatre' : 'theatres'}</span>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}
          >
            <Plus className="w-4 h-4" /> Add Theatre
          </button>
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <div className="rounded-xl overflow-hidden overflow-x-auto" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <tr>
                {['Name', 'Address', 'Phone', 'Screens', 'Showtimes', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3 whitespace-nowrap" style={{ color: '#64748B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {theatres.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-slate-400">
                    No theatres yet. Click "Add Theatre" to create one.
                  </td>
                </tr>
              ) : theatres.map((t) => (
                <tr key={t._id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid #F1F5F9' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                  <td className="px-4 py-3 font-semibold text-slate-800">{t.name}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-48 truncate">{t.address}</td>
                  <td className="px-4 py-3 text-slate-600">{t.phone || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{t.screenCount || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setShowtimesTheatre(t)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                      style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
                    >
                      <Clock className="w-3 h-3" /> Showtimes
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      ><Pencil className="w-4 h-4" /></button>
                      <button
                        onClick={() => setDeleteId(t._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      ><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Action guide */}
      <div className="flex items-center gap-4 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400"><Info className="w-3 h-3" /><span>Row actions:</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Pencil className="w-3 h-3 text-blue-400" /><span>Edit</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Trash2 className="w-3 h-3 text-red-400" /><span>Delete</span></div>
      </div>

      <ConfirmModal isOpen={!!deleteId} title="Delete Theatre" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />

      {showtimesTheatre && (
        <ShowtimesManager theatre={showtimesTheatre} onClose={() => setShowtimesTheatre(null)} />
      )}

      <FormModal isOpen={formOpen} onClose={() => setFormOpen(false)} title={formEditId ? 'Edit Theatre' : 'Add Theatre'}>
        {formDefaults !== null && (
          <TheatreForm defaultValues={formDefaults} onSubmit={handleFormSubmit} loading={formSubmitting} />
        )}
      </FormModal>
    </div>
  )
}
