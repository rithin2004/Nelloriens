import { useEffect, useState, useCallback } from 'react'
import { Trash2, RotateCcw, AlertTriangle, Clock, Package, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { recycleBinApi } from '../services/api'
import PageHeader from '../components/common/PageHeader'
import ConfirmModal from '../components/common/ConfirmModal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate } from '../utils/helpers'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const MODULE_LABELS = {
  news: 'News', jobs: 'Jobs', results: 'Results', sports: 'Sports',
  foods: 'Foods', history: 'History', stays: 'Stays', events: 'Events',
  movies: 'Movies', theatres: 'Theatres', transport: 'Transport',
  offers: 'Offers', tourism: 'Tourism', updates: 'Updates',
  ads: 'Ads', sponsorships: 'Sponsorships',
}

const MODULE_COLORS = {
  news: { bg: '#EFF6FF', color: '#1D4ED8' },
  jobs: { bg: '#F0FDF4', color: '#15803D' },
  results: { bg: '#FFF7ED', color: '#C2410C' },
  sports: { bg: '#FDF4FF', color: '#7E22CE' },
  foods: { bg: '#FFF1F2', color: '#BE123C' },
  history: { bg: '#F8FAFC', color: '#475569' },
  stays: { bg: '#F0FDFA', color: '#0F766E' },
  events: { bg: '#FFFBEB', color: '#B45309' },
  movies: { bg: '#FDF2F8', color: '#9D174D' },
  theatres: { bg: '#FEF3C7', color: '#92400E' },
  transport: { bg: '#EFF6FF', color: '#1E40AF' },
  offers: { bg: '#FFF1F2', color: '#DC2626' },
  tourism: { bg: '#F0FDF4', color: '#166534' },
  updates: { bg: '#EEF2FF', color: '#3730A3' },
  ads: { bg: '#FFF7ED', color: '#EA580C' },
  sponsorships: { bg: '#FDF4FF', color: '#6D28D9' },
}

function timeUntilExpiry(expiresAt) {
  const diff = new Date(expiresAt) - new Date()
  if (diff <= 0) return 'Expires soon'
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h left`
  return `${hours}h left`
}

function isExpiringSoon(expiresAt) {
  const diff = new Date(expiresAt) - new Date()
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000 // less than 3 days
}

export default function RecycleBin() {
  const [data,          setData]          = useState([])
  const [loading,       setLoading]       = useState(true)
  const [page,          setPage]          = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)
  const [total,         setTotal]         = useState(0)
  const [moduleFilter,  setModuleFilter]  = useState('')
  const [stats,         setStats]         = useState(null)

  // Restore state
  const [restoreItem,   setRestoreItem]   = useState(null)
  const [restoring,     setRestoring]     = useState(false)

  // Delete state
  const [purgeItem,     setPurgeItem]     = useState(null)
  const [purging,       setPurging]       = useState(false)

  // Purge all state
  const [purgeAllOpen,  setPurgeAllOpen]  = useState(false)
  const [purgingAll,    setPurgingAll]    = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    recycleBinApi.list({ page, limit: 20, module: moduleFilter })
      .then((r) => {
        setData(r.data.items || [])
        setTotalPages(r.data.totalPages || 1)
        setTotal(r.data.total || 0)
      })
      .catch(() => toast.error('Failed to load recycle bin'))
      .finally(() => setLoading(false))
  }, [page, moduleFilter])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    recycleBinApi.stats()
      .then((r) => setStats(r.data.data))
      .catch(() => {})
  }, [data])

  const handleRestore = async () => {
    setRestoring(true)
    try {
      await recycleBinApi.restore(restoreItem.module, restoreItem._id)
      toast.success(`"${restoreItem.title}" restored successfully`)
      setRestoreItem(null)
      fetchData()
    } catch { toast.error('Restore failed') }
    finally { setRestoring(false) }
  }

  const handlePurge = async () => {
    setPurging(true)
    try {
      await recycleBinApi.purge(purgeItem.module, purgeItem._id)
      toast.success('Item permanently deleted')
      setPurgeItem(null)
      fetchData()
    } catch { toast.error('Delete failed') }
    finally { setPurging(false) }
  }

  const handlePurgeAll = async () => {
    setPurgingAll(true)
    try {
      await recycleBinApi.purgeAll(moduleFilter || undefined)
      toast.success('Recycle bin emptied')
      setPurgeAllOpen(false)
      fetchData()
    } catch { toast.error('Failed to empty recycle bin') }
    finally { setPurgingAll(false) }
  }

  const inp = 'px-3 py-2 text-sm rounded-lg focus:outline-none transition-all'
  const inpStyle = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }
  const inpFocus = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
  const inpBlur  = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Recycle Bin"
        subtitle={total > 0 ? `${total} item${total === 1 ? '' : 's'} — auto-deleted after 15 days` : 'Empty'}
        action={
          total > 0 && (
            <button
              onClick={() => setPurgeAllOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
              style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FECACA'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FEE2E2'}
            >
              <Trash2 className="w-4 h-4" /> Empty {moduleFilter ? MODULE_LABELS[moduleFilter] : 'All'}
            </button>
          )
        }
      />

      {/* Info banner */}
      <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-lg text-xs text-blue-700"
        style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
        <span>
          <strong>Manual deletes</strong> and <strong>content older than 90 days</strong> are moved here automatically.
          Items are permanently deleted after <strong>15 days</strong> in the bin. Restore them before they expire.
        </span>
      </div>

      {/* Stats pills */}
      {stats && stats.total > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(stats.byModule)
            .filter(([, count]) => count > 0)
            .map(([mod, count]) => {
              const c = MODULE_COLORS[mod] || { bg: PL, color: P }
              return (
                <button
                  key={mod}
                  onClick={() => { setModuleFilter(mod === moduleFilter ? '' : mod); setPage(1) }}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: mod === moduleFilter ? c.color : c.bg,
                    color:      mod === moduleFilter ? '#fff'   : c.color,
                    border:     `1px solid ${c.color}22`,
                  }}
                >
                  {MODULE_LABELS[mod]} · {count}
                </button>
              )
            })}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={moduleFilter}
          onChange={(e) => { setModuleFilter(e.target.value); setPage(1) }}
          className={inp} style={inpStyle} onFocus={inpFocus} onBlur={inpBlur}
        >
          <option value="">All Modules</option>
          {Object.entries(MODULE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        {moduleFilter && (
          <button
            onClick={() => { setModuleFilter(''); setPage(1) }}
            className="px-3 py-2 text-xs rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            style={{ border: '1px solid #E2E8F0' }}
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-white"
          style={{ border: '1px solid #E2E8F0' }}>
          <Package className="w-10 h-10 mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">
            {moduleFilter ? `No deleted ${MODULE_LABELS[moduleFilter]} items` : 'Recycle bin is empty'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: PB, borderBottom: `1px solid ${PL}` }}>
                <tr>
                  {['', 'Title', 'Module', 'Reason', 'Deleted', 'Expires', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3 text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const modColor = MODULE_COLORS[item.module] || { bg: PL, color: P }
                  const expiring = isExpiringSoon(item.expiresAt)
                  return (
                    <tr key={`${item.module}-${item._id}`}
                      style={{ borderBottom: '1px solid #F1F5F9' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = PB}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}>

                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        {item.thumbnail
                          ? <img src={item.thumbnail} className="w-10 h-8 object-cover rounded-lg" alt="" />
                          : <div className="w-10 h-8 rounded-lg bg-slate-100" />}
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3 max-w-xs">
                        <span className="font-medium text-slate-800 line-clamp-2">{item.title}</span>
                        <span className="block text-xs text-slate-400 mt-0.5">{item._id}</span>
                      </td>

                      {/* Module */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: modColor.bg, color: modColor.color }}>
                          {MODULE_LABELS[item.module] || item.module}
                        </span>
                      </td>

                      {/* Delete Reason */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={item.deleteReason === 'expired'
                            ? { background: '#FEF3C7', color: '#92400E' }
                            : { background: '#FEE2E2', color: '#DC2626' }}>
                          {item.deleteReason === 'expired' ? 'Auto (90 days)' : 'Manual delete'}
                        </span>
                      </td>

                      {/* Deleted At */}
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(item.deletedAt)}
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs font-medium ${expiring ? 'text-red-500' : 'text-slate-400'}`}>
                          <Clock className="w-3 h-3" />
                          {timeUntilExpiry(item.expiresAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setRestoreItem(item)}
                            title="Restore"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors"
                            style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#BBF7D0'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#DCFCE7'}
                          >
                            <RotateCcw className="w-3 h-3" /> Restore
                          </button>
                          <button
                            onClick={() => setPurgeItem(item)}
                            title="Delete permanently"
                            className="p-1.5 rounded-lg text-slate-400 transition-colors"
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEE2E2' }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: `1px solid ${PL}`, background: PB }}>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg disabled:opacity-30"
                  style={{ border: '1px solid #CBD5E1' }}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg disabled:opacity-30"
                  style={{ border: '1px solid #CBD5E1' }}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400"><Info className="w-3 h-3" /><span>Row actions:</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><RotateCcw className="w-3 h-3 text-green-500" /><span>Restore to live</span></div>
        <div className="flex items-center gap-1 text-xs text-slate-400"><Trash2 className="w-3 h-3 text-red-400" /><span>Delete permanently</span></div>
      </div>

      {/* Restore Confirm */}
      <ConfirmModal
        isOpen={!!restoreItem}
        title="Restore Item"
        message={`Restore "${restoreItem?.title}" back to ${MODULE_LABELS[restoreItem?.module] || restoreItem?.module}?`}
        confirmLabel="Restore"
        confirmStyle={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)' }}
        onConfirm={handleRestore}
        onCancel={() => setRestoreItem(null)}
        loading={restoring}
      />

      {/* Permanent Delete Confirm */}
      <ConfirmModal
        isOpen={!!purgeItem}
        title="Delete Permanently"
        message={`This will permanently delete "${purgeItem?.title}". This cannot be undone.`}
        onConfirm={handlePurge}
        onCancel={() => setPurgeItem(null)}
        loading={purging}
      />

      {/* Empty All Confirm */}
      <ConfirmModal
        isOpen={purgeAllOpen}
        title={`Empty ${moduleFilter ? MODULE_LABELS[moduleFilter] : 'Recycle Bin'}`}
        message={`This will permanently delete all ${moduleFilter ? MODULE_LABELS[moduleFilter] : ''} items in the recycle bin. This cannot be undone.`}
        onConfirm={handlePurgeAll}
        onCancel={() => setPurgeAllOpen(false)}
        loading={purgingAll}
      />
    </div>
  )
}
