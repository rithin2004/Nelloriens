import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useUnsavedWarning } from '../../hooks/useUnsavedWarning'

export default function FormModal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl', isDirty = false }) {
  useUnsavedWarning(isOpen && isDirty)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl shadow-2xl animate-slide-up flex flex-col max-h-[90vh]`}
        style={{ background: '#FFFFFF', border: '1px solid #dce8fb', boxShadow: '0 24px 64px rgba(10,61,149,0.12), 0 4px 16px rgba(0,0,0,0.08)' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5 shrink-0 rounded-t-2xl"
          style={{ borderBottom: '1px solid #dce8fb', background: '#eef3fd' }}
        >
          <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="text-sm mt-0.5 text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
