import { useEffect, useState } from 'react'
import { RefreshCw, RotateCcw, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { instagramApi } from '../../services/api'
import { formatDate, timeAgo } from '../../utils/helpers'

export default function InstagramManager() {
  const [status, setStatus] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      instagramApi.getStatus().then((r) => setStatus(r.data)).catch(() => {}),
      instagramApi.getPosts().then((r) => setPosts(r.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleSync = async () => {
    setSyncing(true)
    try { await instagramApi.sync(); toast.success('Sync complete!'); fetchAll() }
    catch (e) { toast.error(e.message) }
    finally { setSyncing(false) }
  }

  const handleRefreshToken = async () => {
    setRefreshing(true)
    try { await instagramApi.refreshToken(); toast.success('Token refreshed!'); fetchAll() }
    catch (e) { toast.error(e.message) }
    finally { setRefreshing(false) }
  }

  const handleToggle = async (post) => {
    try {
      await instagramApi.hidePost(post._id)
      setPosts((prev) => prev.map((p) => p._id === post._id ? { ...p, hidden: !p.hidden } : p))
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div>
      <PageHeader title="Instagram Manager" action={
        <div className="flex gap-2">
          <button onClick={handleRefreshToken} disabled={refreshing} className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-sm rounded-lg disabled:opacity-60">
            <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh Token
          </button>
          <button onClick={handleSync} disabled={syncing} className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />Sync Posts
          </button>
        </div>
      } />

      {/* Status bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 flex gap-6 flex-wrap text-sm">
        <div>
          <span className="text-slate-500">Token expires:</span>{' '}
          <span className="font-medium text-slate-800">{status?.tokenExpiry ? formatDate(status.tokenExpiry) : '—'}</span>
        </div>
        <div>
          <span className="text-slate-500">Last synced:</span>{' '}
          <span className="font-medium text-slate-800">{status?.lastSync ? timeAgo(status.lastSync) : '—'}</span>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div key={post._id} className={`relative bg-white rounded-xl border overflow-hidden ${post.hidden ? 'border-slate-200 opacity-60' : 'border-slate-200'}`}>
              <div className="aspect-square bg-slate-100">
                {post.thumbnailUrl && <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="p-2">
                <p className="text-xs text-slate-600 line-clamp-2">{post.caption || '—'}</p>
                <span className="text-[10px] text-slate-400 uppercase mt-1 block">{post.mediaType}</span>
              </div>
              <button
                onClick={() => handleToggle(post)}
                title={post.hidden ? 'Show post' : 'Hide post'}
                className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full shadow text-slate-600 hover:text-purple-600"
              >
                {post.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
