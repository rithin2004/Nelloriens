import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import ConfirmModal from '../../components/common/ConfirmModal'
import { transportApi } from '../../services/api'

const inp = 'px-3 py-1.5 text-sm rounded-lg focus:outline-none transition-all'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }

// Default seed categories
const DEFAULT_NAMES = ['Train', 'Bus', 'Airport']

export default function TransportCategories() {
  const [categories, setCategories] = useState([])
  const [newName, setNewName]       = useState('')
  const [adding, setAdding]         = useState(false)
  const [editId, setEditId]         = useState(null)
  const [editName, setEditName]     = useState('')
  const [saving, setSaving]         = useState(false)
  const [deleteId, setDeleteId]     = useState(null)
  const [deleting, setDeleting]     = useState(false)

  const fetch = () => transportApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  useEffect(() => { fetch() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setAdding(true)
    try { await transportApi.createCategory({ name: newName.trim() }); setNewName(''); fetch(); toast.success('Category created') }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed') }
    finally { setAdding(false) }
  }

  const handleUpdate = async (id) => {
    if (!editName.trim()) return
    setSaving(true)
    try { await transportApi.updateCategory(id, { name: editName.trim() }); setEditId(null); fetch(); toast.success('Updated') }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await transportApi.deleteCategory(deleteId); setDeleteId(null); fetch(); toast.success('Deleted') }
    catch (e) { toast.error(e?.response?.data?.message || 'Delete failed') }
    finally { setDeleting(false) }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Transport Categories" backTo="/transport" />

      {categories.length === 0 && (
        <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: '#eef3fd', border: '1px solid #dce8fb', color: '#072d6e' }}>
          Tip: Add categories like <strong>Train</strong>, <strong>Bus</strong>, <strong>Airport</strong> — the form fields will adapt based on the selected category.
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="p-4 flex gap-2" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="New category (e.g. Train, Bus, Airport)"
            className={`flex-1 ${inp}`}
            style={inpStyle}
            onFocus={(e) => { e.target.style.borderColor = '#0a3d95'; e.target.style.boxShadow = '0 0 0 3px rgba(2,132,199,0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }}
          />
          <button
            onClick={handleCreate}
            disabled={adding || !newName.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}
          >
            <Plus className="w-4 h-4" />
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
        <ul>
          {categories.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-slate-400">No categories yet. Add Train, Bus, Airport to start.</li>
          )}
          {categories.map((c) => (
            <li key={c._id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #F8FAFC' }}>
              {editId === c._id ? (
                <>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(c._id); if (e.key === 'Escape') setEditId(null) }} autoFocus className={`flex-1 ${inp}`} style={inpStyle} onFocus={(e) => { e.target.style.borderColor = '#0a3d95'; e.target.style.boxShadow = '0 0 0 3px rgba(2,132,199,0.1)' }} onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }} />
                  <button onClick={() => handleUpdate(c._id)} disabled={saving} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-slate-700">{c.name}</span>
                  <button onClick={() => { setEditId(c._id); setEditName(c.name) }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.background = '#eef3fd'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors" onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><Trash2 className="w-4 h-4" /></button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <ConfirmModal isOpen={!!deleteId} title="Delete Category" message="This will permanently delete this category." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  )
}
