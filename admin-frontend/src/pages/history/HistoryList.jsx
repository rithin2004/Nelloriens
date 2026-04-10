import { useEffect, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { historyApi } from '../../services/api'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormModal from '../../components/common/FormModal'
import HistoryForm from '../../components/forms/HistoryForm'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function SortableCard({ item, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item._id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      className="flex items-center gap-3 rounded-xl p-3 mb-2 transition-all hover:shadow-md"
    >
      <button {...attributes} {...listeners} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0">
        <GripVertical className="w-5 h-5" />
      </button>
      {item.thumbnail && <img src={item.thumbnail} className="w-12 h-10 object-cover rounded-lg shrink-0" alt="" />}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm truncate">{item.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{item.eraPeriod}{item.yearLabel ? ` · ${item.yearLabel}` : ''}</p>
      </div>
      <StatusBadge status={item.status} />
      <button
        onClick={() => onEdit(item._id)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
        onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(item._id)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
        onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function HistoryList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Form modal state
  const [formOpen, setFormOpen] = useState(false)
  const [formDefaults, setFormDefaults] = useState(null)
  const [formEditId, setFormEditId] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching, setFormFetching] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  const fetchData = () => {
    setLoading(true)
    historyApi.getAll({ limit: 100 })
      .then((r) => setItems(r.data.items || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i._id === active.id)
    const newIndex = items.findIndex((i) => i._id === over.id)
    const newOrder = arrayMove(items, oldIndex, newIndex)
    setItems(newOrder)
    try {
      await historyApi.reorder(newOrder.map((i, idx) => ({ id: i._id, order: idx })))
    } catch { toast.error('Reorder failed'); fetchData() }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await historyApi.delete(deleteId); toast.success('Deleted'); setDeleteId(null); fetchData() }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = () => {
    setFormDefaults({})
    setFormEditId(null)
    setFormOpen(true)
  }

  const openEdit = async (id) => {
    setFormFetching(true)
    setFormDefaults(null)
    setFormEditId(id)
    setFormOpen(true)
    try {
      const r = await historyApi.getById(id)
      setFormDefaults(r.data)
    } catch {
      toast.error('Failed to load')
      setFormOpen(false)
    } finally {
      setFormFetching(false)
    }
  }

  const handleFormSubmit = async (data) => {
    setFormSubmitting(true)
    try {
      if (formEditId) {
        await historyApi.update(formEditId, data)
        toast.success('Updated!')
      } else {
        await historyApi.create(data)
        toast.success('Created!')
      }
      setFormOpen(false)
      fetchData()
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Save failed')
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="History"
        subtitle="Drag to reorder"
        action={
          <button
            onClick={openCreate}
            className="btn-shine flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}
          >
            <Plus className="w-4 h-4" /> Add History
          </button>
        }
      />

      {loading ? <LoadingSpinner /> : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
            {items.length === 0 ? (
              <div className="text-center py-16 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <p className="text-sm text-slate-400">No history items yet. Click "Add History" to create one.</p>
              </div>
            ) : items.map((item) => (
              <SortableCard key={item._id} item={item} onEdit={openEdit} onDelete={setDeleteId} />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete History Item"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={formEditId ? 'Edit History' : 'Add History'}
      >
        {formFetching || formDefaults === null ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: '3px solid #dce8fb', borderTopColor: '#0a3d95' }} />
          </div>
        ) : (
          <HistoryForm defaultValues={formDefaults} onSubmit={handleFormSubmit} loading={formSubmitting} />
        )}
      </FormModal>
    </div>
  )
}
