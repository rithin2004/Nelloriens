export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #E2E8F0' }}>
      <p className="text-sm" style={{ color: '#64748B' }}>
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-lg text-slate-600 disabled:opacity-30 hover:text-slate-900 transition-colors"
          style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded-lg text-slate-600 disabled:opacity-30 hover:text-slate-900 transition-colors"
          style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}
        >
          Next
        </button>
      </div>
    </div>
  )
}
