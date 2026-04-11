import { createPortal } from 'react-dom'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999 }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 animate-slide-up"
        style={{ background: '#FFFFFF', border: '1px solid #dce8fb', boxShadow: '0 20px 48px rgba(10,61,149,0.12), 0 4px 16px rgba(0,0,0,0.08)' }}
      >
        <h3 className="text-base font-semibold text-slate-800">{title || 'Confirm'}</h3>
        <p className="mt-2 text-sm text-slate-500">{message || 'Are you sure? This action cannot be undone.'}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            style={{ border: '1px solid #E2E8F0' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', boxShadow: '0 4px 12px rgba(239,68,68,0.25)' }}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
