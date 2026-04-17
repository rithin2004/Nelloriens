import { useEffect, useRef, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { historyApi, uploadApi } from '../../services/api'
import useHistoryStore from '../../store/historyStore'
import PageHeader from '../../components/common/PageHeader'
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
  // Subscribe to store so SSE-triggered fetches auto-refresh this page
  const { items: storeItems, loading, fetch: storeFetch } = useHistoryStore()
  const [items, setItems] = useState([])
  const prevStoreRef = useRef(storeItems)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Form modal state
  const [formOpen, setFormOpen] = useState(false)
  const [formDefaults, setFormDefaults] = useState(null)
  const [formEditId, setFormEditId] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formFetching, setFormFetching] = useState(false)
  const [reservedId, setReservedId] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor))

  // Initial load via store (sets _params so SSE re-fetches use same params)
  useEffect(() => { storeFetch({ limit: 100 }) }, [storeFetch])

  // Sync store → local items (initial + SSE updates)
  useEffect(() => {
    if (storeItems === prevStoreRef.current) return
    prevStoreRef.current = storeItems
    setItems(storeItems)
  }, [storeItems])

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i._id === active.id)
    const newIndex = items.findIndex((i) => i._id === over.id)
    const newOrder = arrayMove(items, oldIndex, newIndex)
    setItems(newOrder)
    try {
      await historyApi.reorder(newOrder.map((i) => i._id))
    } catch { toast.error('Reorder failed'); storeFetch({ limit: 100 }) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await historyApi.delete(deleteId); toast.success('Deleted'); setDeleteId(null); storeFetch({ limit: 100 }) }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const openCreate = async () => {
    setFormEditId(null)
    try { const r = await uploadApi.reserveId('HIS'); setReservedId(r.data.data.id) }
    catch { toast.error('Failed to reserve ID — please try again'); return }
    setFormDefaults({})
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
        await historyApi.create(reservedId ? { ...data, _reservedId: reservedId } : data)
        toast.success('Created!')
      }
      setFormOpen(false); setReservedId(null)
      storeFetch({ limit: 100 })
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Save failed')
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in">
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
          <HistoryForm defaultValues={formDefaults} onSubmit={handleFormSubmit} loading={formSubmitting} contentId={formEditId || reservedId} />
        )}
      </FormModal>
    </div>
  )
}
