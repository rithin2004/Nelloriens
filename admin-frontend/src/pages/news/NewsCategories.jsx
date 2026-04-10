import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import ConfirmModal from '../../components/common/ConfirmModal'
import { newsApi } from '../../services/api'

const input = 'px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500'

export default function NewsCategories() {
  const [categories, setCategories] = useState([])
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const fetch = () => newsApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})

  useEffect(() => { fetch() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    try { await newsApi.createCategory({ name: newName }); setNewName(''); fetch(); toast.success('Created') }
    catch (e) { toast.error(e.message) }
  }

  const handleUpdate = async (id) => {
    try { await newsApi.updateCategory(id, { name: editName }); setEditId(null); fetch(); toast.success('Updated') }
    catch (e) { toast.error(e.message) }
  }

  const handleDelete = async () => {
    try { await newsApi.deleteCategory(deleteId); setDeleteId(null); fetch(); toast.success('Deleted') }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="News Categories" backTo="/news" />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreate()} className={input} placeholder="New category name" />
          <button onClick={handleCreate} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"><Plus className="w-4 h-4" />Add</button>
        </div>
        <ul className="divide-y divide-slate-100">
          {categories.map((c) => (
            <li key={c._id} className="flex items-center gap-3 px-4 py-3">
              {editId === c._id ? (
                <>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className={`flex-1 ${input}`} />
                  <button onClick={() => handleUpdate(c._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-slate-700">{c.name}</span>
                  <button onClick={() => { setEditId(c._id); setEditName(c.name) }} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-slate-100 rounded"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(c._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <ConfirmModal isOpen={!!deleteId} title="Delete Category" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
