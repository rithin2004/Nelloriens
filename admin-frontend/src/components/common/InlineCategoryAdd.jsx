import { useState, useRef, useEffect } from 'react'
import { Plus, Check, X, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InlineCategoryAdd({ onAdd, placeholder = 'Enter name', label = 'Add' }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!containerRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!value.trim()) return
    setLoading(true)
    try {
      await onAdd(value.trim())
      toast.success(`${label} added!`)
      setValue('')
      setOpen(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        title={`Add new ${label.toLowerCase()}`}
        className="inline-flex items-center justify-center w-5 h-5 rounded transition-all"
        style={{
          background: open ? '#dce8fb' : '#dce8fb',
          border: '1px solid #7DD3FC',
          color: '#0a3d95',
        }}
      >
        <Plus className="w-3 h-3" />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-9999 rounded-xl shadow-xl animate-fade-in-down"
          style={{
            background: '#FFFFFF',
            border: '1px solid #dce8fb',
            width: '260px',
            padding: '12px',
            boxShadow: '0 12px 32px rgba(10,61,149,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <p className="text-xs font-semibold mb-2 text-slate-500">Add {label}</p>
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              id="inline-cat-input"
              name="categoryName"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); setValue('') } }}
              placeholder={placeholder}
              className="w-full px-2.5 py-1.5 text-sm rounded-lg focus:outline-none mb-2"
              style={{ background: '#eef3fd', border: '1px solid #dce8fb', color: '#0F172A' }}
              onFocus={(e) => { e.target.style.borderColor = '#0a3d95'; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }}
              onBlur={(e) => { e.target.style.borderColor = '#dce8fb'; e.target.style.boxShadow = '' }}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setOpen(false); setValue('') }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                style={{ border: '1px solid #E2E8F0' }}
              >
                <X className="w-3 h-3" /> Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-white transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#0a3d95,#072d6e)' }}
              >
                {loading ? <Loader className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
