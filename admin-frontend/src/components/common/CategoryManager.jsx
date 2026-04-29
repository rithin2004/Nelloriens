/**
 * CategoryManager — reusable full-width CRUD page for categories, locations, etc.
 *
 * Props:
 *   title        — page heading
 *   entityLabel  — singular noun shown in buttons/modals ("Category", "Location" …)
 *   getAll       — () => Promise  (returns array)
 *   create       — (data) => Promise
 *   update       — (id, data) => Promise
 *   remove       — (id) => Promise
 *   nameKey      — field name for the item label (default "name")
 */
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Search, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from './PageHeader'
import ConfirmModal from './ConfirmModal'

const pluralize = (word) => {
  if (word.endsWith('y') && !/[aeiou]y$/.test(word)) return word.slice(0, -1) + 'ies'
  if (/[^s]s$/.test(word) || word.endsWith('x') || word.endsWith('z') || word.endsWith('ch') || word.endsWith('sh')) return word + 'es'
  return word + 's'
}

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const inp = 'px-3 py-2 text-sm rounded-lg focus:outline-none transition-all'
const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }
const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = `0 0 0 3px rgba(10,61,149,0.1)` }
const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

export default function CategoryManager({
  title,
  entityLabel = 'Item',
  backTo,
  getAll,
  create,
  update,
  remove,
  nameKey = 'name',
  hideHeader = false,
}) {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  // add state
  const [showAdd,  setShowAdd]  = useState(false)
  const [addName,  setAddName]  = useState('')
  const [adding,   setAdding]   = useState(false)

  // edit state
  const [editId,   setEditId]   = useState(null)
  const [editName, setEditName] = useState('')
  const [saving,   setSaving]   = useState(false)

  // delete state
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = () => {
    setLoading(true)
    getAll()
      .then((r) => setItems(r.data.data || []))
      .catch(() => toast.error(`Failed to load ${title}`))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!addName.trim()) { toast.error(`${entityLabel} name cannot be empty`); return }
    setAdding(true)
    try {
      await create({ [nameKey]: addName.trim() })
      const name = addName.trim()
      setAddName(''); setShowAdd(false)
      toast.success(`${entityLabel} "${name}" created`)
      fetchData()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed') }
    finally { setAdding(false) }
  }

  const handleUpdate = async (id) => {
    if (!editName.trim()) { toast.error(`${entityLabel} name cannot be empty`); return }
    setSaving(true)
    try {
      await update(id, { [nameKey]: editName.trim() })
      const name = editName.trim()
      setEditId(null)
      toast.success(`${entityLabel} "${name}" updated`)
      fetchData()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await remove(deleteId)
      setDeleteId(null)
      toast.success('Deleted')
      fetchData()
    } catch (e) { toast.error(e?.response?.data?.message || 'Delete failed') }
    finally { setDeleting(false) }
  }

  const filtered = items.filter((i) =>
    (i[nameKey] || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={hideHeader ? '' : 'animate-fade-in'}>
      {!hideHeader && (
        <PageHeader
          title={title}
          backTo={backTo}
          subtitle={`${items.length} ${items.length === 1 ? entityLabel.toLowerCase() : pluralize(entityLabel.toLowerCase())}`}
          action={
            <button
              onClick={() => { setShowAdd(true); setAddName('') }}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: `0 4px 12px rgba(10,61,149,0.25)` }}
            >
              <Plus className="w-4 h-4" />
              Add {entityLabel}
            </button>
          }
        />
      )}

      {/* When embedded in a tab, show add button + count inline above search */}
      {hideHeader && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500">
            {items.length} {items.length === 1 ? entityLabel.toLowerCase() : pluralize(entityLabel.toLowerCase())}
          </span>
          <button
            onClick={() => { setShowAdd(true); setAddName('') }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: `0 4px 12px rgba(10,61,149,0.25)` }}
          >
            <Plus className="w-4 h-4" />
            Add {entityLabel}
          </button>
        </div>
      )}

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative w-full sm:w-72">
          <label htmlFor={`search-${entityLabel.toLowerCase().replace(/\s+/g,'-')}s`} className="sr-only">
            Search {pluralize(entityLabel.toLowerCase())}
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id={`search-${entityLabel.toLowerCase().replace(/\s+/g,'-')}s`}
            name="search" autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${pluralize(entityLabel.toLowerCase())}…`}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          />
        </div>
      </div>

      {/* Add row — slides in below search */}
      {showAdd && (
        <div className="mb-4 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-start sm:items-center"
          style={{ background: '#FFFFFF', border: `2px solid ${P}`, boxShadow: `0 0 0 4px rgba(10,61,149,0.06)` }}>
          <div className="flex items-center gap-2 shrink-0">
            <Tag className="w-4 h-4" style={{ color: P }} />
            <span className="text-sm font-semibold" style={{ color: P }}>New {entityLabel}</span>
          </div>
          <label htmlFor="category-add-name" className="sr-only">New {entityLabel} name</label>
          <input
            id="category-add-name" name="categoryName" autoComplete="off"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowAdd(false) }}
            placeholder={`Enter ${entityLabel.toLowerCase()} name…`}
            autoFocus
            className={`flex-1 ${inp}`}
            style={inpStyle}
            onFocus={inpFocus}
            onBlur={inpBlur}
          />
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCreate}
              disabled={adding}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}
            >
              <Check className="w-4 h-4" />
              {adding ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-2 text-sm rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              style={{ border: '1px solid #E2E8F0' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

        {/* Table header */}
        <div className="flex items-center px-4 sm:px-5 py-3"
          style={{ background: PB, borderBottom: `1px solid ${PL}` }}>
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {entityLabel} Name
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 w-20 text-right">
            Actions
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full animate-spin"
              style={{ border: `3px solid ${PL}`, borderTopColor: P }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="w-8 h-8 mx-auto mb-2 text-slate-200" />
            <p className="text-sm text-slate-400">
              {search ? `No results for "${search}"` : `No ${pluralize(entityLabel.toLowerCase())} yet — add one above`}
            </p>
          </div>
        ) : (
          <ul>
            {filtered.map((item, idx) => (
              <li
                key={item._id}
                className="flex items-center gap-3 px-4 sm:px-5 py-3 transition-colors"
                style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F8FAFC' : 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.background = PB}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}
              >
                {editId === item._id ? (
                  /* ── Edit mode ── */
                  <>
                    <label htmlFor={`category-edit-${item._id}`} className="sr-only">Edit {entityLabel} name</label>
                    <input
                      id={`category-edit-${item._id}`} name="categoryName" autoComplete="off"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(item._id)
                        if (e.key === 'Escape') setEditId(null)
                      }}
                      autoFocus
                      className={`flex-1 ${inp}`}
                      style={inpStyle}
                      onFocus={inpFocus}
                      onBlur={inpBlur}
                    />
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleUpdate(item._id)}
                        disabled={saving}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  /* ── View mode ── */
                  <>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: PL, color: P }}>
                      {(item[nameKey] || '?')[0].toUpperCase()}
                    </div>
                    <span className="flex-1 text-sm font-medium text-slate-700">{item[nameKey]}</span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => { setEditId(item._id); setEditName(item[nameKey]) }}
                        className="p-1.5 rounded-lg text-slate-400 transition-colors"
                        title="Edit"
                        onMouseEnter={(e) => { e.currentTarget.style.color = P; e.currentTarget.style.background = PB }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(item._id)}
                        className="p-1.5 rounded-lg text-slate-400 transition-colors"
                        title="Delete"
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEE2E2' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title={`Delete ${entityLabel}`}
        message={`This will permanently delete this ${entityLabel.toLowerCase()}.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  )
}
