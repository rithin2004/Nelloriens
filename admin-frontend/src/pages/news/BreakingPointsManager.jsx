import { useEffect, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2, Plus, Check, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { newsApi } from '../../services/api'
import PageHeader from '../../components/common/PageHeader'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const inp = 'flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none transition-all'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
const focusOn  = (e) => { e.target.style.borderColor = '#0a3d95'; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const focusOff = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

function SortablePoint({ item, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2 transition-all hover:shadow-md"
    >
      <button
        {...attributes} {...listeners}
        className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0 touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#DC2626' }} />

      <p className="flex-1 text-sm text-slate-700 leading-snug">{item.text}</p>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.background = '#eef3fd'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item._id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function BreakingPointsManager() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // inline add/edit
  const [addText, setAddText]   = useState('')
  const [adding, setAdding]     = useState(false)
  const [editItem, setEditItem] = useState(null)   // { _id, text }
  const [editText, setEditText] = useState('')
  const [saving, setSaving]     = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  const fetchData = () => {
    setLoading(true)
    newsApi.getBreakingPoints()
      .then((r) => setItems(r.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleAdd = async () => {
    if (!addText.trim()) return
    setAdding(true)
    try {
      await newsApi.createBreakingPoint({ text: addText.trim() })
      setAddText('')
      toast.success('Point added')
      fetchData()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to add') }
    finally { setAdding(false) }
  }

  const handleUpdate = async () => {
    if (!editText.trim() || !editItem) return
    setSaving(true)
    try {
      await newsApi.updateBreakingPoint(editItem._id, { text: editText.trim() })
      setEditItem(null)
      toast.success('Updated')
      fetchData()
    } catch (e) { toast.error(e?.response?.data?.message || 'Update failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await newsApi.deleteBreakingPoint(deleteId); setDeleteId(null); toast.success('Deleted'); fetchData() }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i._id === active.id)
    const newIndex  = items.findIndex((i) => i._id === over.id)
    const newOrder  = arrayMove(items, oldIndex, newIndex)
    setItems(newOrder)
    try {
      await newsApi.reorderBreakingPoints(newOrder.map((i, idx) => ({ id: i._id, order: idx })))
    } catch { toast.error('Reorder failed'); fetchData() }
  }

  const openEdit = (item) => { setEditItem(item); setEditText(item.text) }
  const cancelEdit = () => { setEditItem(null); setEditText('') }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Breaking News Points" subtitle="Drag to reorder · shown in ticker on user side" />

      {/* Add new */}
      <div
        className="mb-5 p-4 rounded-xl"
        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Add New Point</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={addText}
            onChange={(e) => setAddText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAdd()}
            placeholder="Enter breaking news text…"
            className={`${inp} flex-1`}
            style={inpStyle}
            onFocus={focusOn}
            onBlur={focusOff}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !addText.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 shrink-0"
            style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)', boxShadow: '0 4px 12px rgba(220,38,38,0.25)' }}
          >
            <Plus className="w-4 h-4" />
            {adding ? 'Adding…' : 'Add Point'}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? <LoadingSpinner /> : (
        <>
          {items.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl"
              style={{ background: '#FFFFFF', border: '1px dashed #CBD5E1' }}
            >
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No breaking news points yet.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
                {items.map((item) =>
                  editItem?._id === item._id ? (
                    /* inline edit row */
                    <div
                      key={item._id}
                      className="flex items-center gap-2 mb-2 px-4 py-3 rounded-xl"
                      style={{ background: '#eef3fd', border: '1px solid #dce8fb' }}
                    >
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') cancelEdit() }}
                        autoFocus
                        className={inp}
                        style={inpStyle}
                        onFocus={focusOn}
                        onBlur={focusOff}
                      />
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="p-2 rounded-lg text-white transition-all"
                        style={{ background: '#16A34A' }}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 rounded-lg transition-all text-slate-500 hover:text-slate-700"
                        style={{ background: '#F1F5F9' }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <SortablePoint key={item._id} item={item} onEdit={openEdit} onDelete={setDeleteId} />
                  )
                )}
              </SortableContext>
            </DndContext>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Breaking Point"
        message="This will remove this breaking news point from the ticker."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  )
}
