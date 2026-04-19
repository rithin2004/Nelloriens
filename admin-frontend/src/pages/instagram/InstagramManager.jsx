import { useEffect, useState } from 'react'
import { RefreshCw, RotateCcw, Eye, EyeOff, Link2, Link2Off, Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import FormModal from '../../components/common/FormModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ImageUpload from '../../components/common/ImageUpload'
import { instagramApi, uploadApi } from '../../services/api'
import { formatDate, timeAgo } from '../../utils/helpers'

export default function InstagramManager() {
  const [status, setStatus]   = useState(null)
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Connect modal
  const [connectOpen, setConnectOpen] = useState(false)
  const [connectForm, setConnectForm] = useState({ accessToken: '', username: '' })
  const [connecting, setConnecting]   = useState(false)

  // Disconnect confirm
  const [disconnectOpen, setDisconnectOpen] = useState(false)
  const [disconnecting, setDisconnecting]   = useState(false)

  // Manual post modal
  const [postOpen, setPostOpen]     = useState(false)
  const [postForm, setPostForm]     = useState({})
  const [postEditId, setPostEditId] = useState(null)
  const [postSaving, setPostSaving] = useState(false)
  const [postReservedId, setPostReservedId] = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [deleting, setDeleting]     = useState(false)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      instagramApi.getStatus().then((r) => setStatus(r.data.data)).catch(() => {}),
      instagramApi.getPosts().then((r) => setPosts(r.data.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const connected = !!status?.connected

  // ── Connected actions ───────────────────────────────────────────────────
  const handleSync = async () => {
    setSyncing(true)
    try { await instagramApi.sync(); toast.success('Sync complete!'); fetchAll() }
    catch (e) { toast.error(e?.response?.data?.message || e.message) }
    finally { setSyncing(false) }
  }

  const handleRefreshToken = async () => {
    setRefreshing(true)
    try { await instagramApi.refreshToken(); toast.success('Token refreshed!'); fetchAll() }
    catch (e) { toast.error(e?.response?.data?.message || e.message) }
    finally { setRefreshing(false) }
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try { await instagramApi.disconnect(); toast.success('Disconnected'); setDisconnectOpen(false); fetchAll() }
    catch (e) { toast.error(e.message) }
    finally { setDisconnecting(false) }
  }

  // ── Connect ─────────────────────────────────────────────────────────────
  const handleConnect = async (e) => {
    e.preventDefault()
    if (!connectForm.accessToken.trim()) { toast.error('Access token is required'); return }
    setConnecting(true)
    try {
      await instagramApi.connect(connectForm)
      toast.success('Instagram connected!')
      setConnectOpen(false)
      setConnectForm({ accessToken: '', username: '' })
      fetchAll()
    } catch (e) { toast.error(e?.response?.data?.message || 'Connect failed') }
    finally { setConnecting(false) }
  }

  // ── Manual posts ─────────────────────────────────────────────────────────
  const openAddPost = async () => {
    setPostEditId(null); setPostForm({})
    try { const r = await uploadApi.reserveId('INS'); setPostReservedId(r.data.data.id) }
    catch { toast.error('Failed to reserve ID — please try again'); return }
    setPostOpen(true)
  }
  const openEditPost = (p) => { setPostEditId(p._id); setPostReservedId(null); setPostForm({ ...p }); setPostOpen(true) }

  const handleSavePost = async (e) => {
    e.preventDefault()
    setPostSaving(true)
    try {
      if (postEditId) {
        await instagramApi.updatePost(postEditId, postForm)
        toast.success('Post updated')
      } else {
        const payload = postReservedId ? { ...postForm, _reservedId: postReservedId } : postForm
        await instagramApi.createPost(payload)
        toast.success('Post added')
      }
      setPostOpen(false); setPostReservedId(null)
      fetchAll()
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setPostSaving(false) }
  }

  const handleDeletePost = async () => {
    setDeleting(true)
    try { await instagramApi.hidePost(deleteId); toast.success('Deleted'); setDeleteId(null); fetchAll() }
    catch (e) { toast.error(e.message) }
    finally { setDeleting(false) }
  }

  const handleToggleHide = async (post) => {
    try {
      await instagramApi.hidePost(post._id)
      setPosts((prev) => prev.map((p) => p._id === post._id ? { ...p, hidden: !p.hidden } : p))
    } catch (e) { toast.error(e.message) }
  }

  const inpC = 'w-full px-3 py-2 text-sm rounded-xl focus:outline-none transition-all'
  const inpS = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
  const lbl  = 'block text-xs font-semibold uppercase tracking-wide mb-1.5 text-slate-500'

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Instagram"
        action={
          <div className="flex gap-2 flex-wrap">
            {connected ? (
              <>
                <button
                  onClick={handleRefreshToken} disabled={refreshing}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-60"
                  style={{ border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569' }}
                >
                  <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Token
                </button>
                <button
                  onClick={handleSync} disabled={syncing}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  Sync Posts
                </button>
                <button
                  onClick={() => setDisconnectOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all text-red-500 hover:text-red-700"
                  style={{ border: '1px solid #FECACA', background: '#FEF2F2' }}
                >
                  <Link2Off className="w-4 h-4" />
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={openAddPost}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}
                >
                  <Plus className="w-4 h-4" /> Add Post
                </button>
                <button
                  onClick={() => setConnectOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg"
                  style={{ background: 'linear-gradient(135deg,#E1306C,#833AB4)', boxShadow: '0 4px 12px rgba(225,48,108,0.25)' }}
                >
                  <Link2 className="w-4 h-4" /> Connect Instagram
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Status bar (connected only) */}
      {connected && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 flex gap-6 flex-wrap text-sm">
          {status?.username && (
            <div><span className="text-slate-500">Account:</span>{' '}
              <span className="font-medium text-slate-800">@{status.username}</span>
            </div>
          )}
          <div><span className="text-slate-500">Token expires:</span>{' '}
            <span className="font-medium text-slate-800">{status?.tokenExpiry ? formatDate(status.tokenExpiry) : '—'}</span>
          </div>
          <div><span className="text-slate-500">Last synced:</span>{' '}
            <span className="font-medium text-slate-800">{status?.lastSync ? timeAgo(status.lastSync) : 'Never'}</span>
          </div>
        </div>
      )}

      {/* Not connected banner */}
      {!connected && !loading && (
        <div className="rounded-xl p-4 mb-5 flex items-center gap-3 text-sm"
          style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
          <Link2Off className="w-4 h-4 shrink-0" style={{ color: '#EA580C' }} />
          <span style={{ color: '#9A3412' }}>
            Instagram is not connected. Posts below are managed manually. Connect to sync from Instagram automatically.
          </span>
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        posts.length === 0 ? (
          <div className="text-center py-16 rounded-xl" style={{ background: '#FFFFFF', border: '1px dashed #CBD5E1' }}>
            <p className="text-sm text-slate-400">No posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className={`relative bg-white rounded-xl border overflow-hidden transition-all ${post.hidden ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:shadow-md'}`}
              >
                <div className="aspect-square bg-slate-100">
                  {(post.thumbnailUrl || post.mediaUrl) && (
                    <img src={post.thumbnailUrl || post.mediaUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-slate-600 line-clamp-2">{post.caption || '—'}</p>
                  <span className="text-[10px] text-slate-400 uppercase mt-1 block">{post.mediaType}</span>
                </div>
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {!connected && (
                    <button
                      onClick={() => openEditPost(post)}
                      className="p-1.5 bg-white/90 rounded-full shadow text-slate-500 hover:text-blue-600"
                    ><Pencil className="w-3.5 h-3.5" /></button>
                  )}
                  <button
                    onClick={() => connected ? handleToggleHide(post) : setDeleteId(post._id)}
                    title={connected ? (post.hidden ? 'Show' : 'Hide') : 'Delete'}
                    className="p-1.5 bg-white/90 rounded-full shadow text-slate-500 hover:text-purple-600"
                  >
                    {connected
                      ? (post.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />)
                      : <Trash2 className="w-3.5 h-3.5 hover:text-red-500" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Connect modal */}
      <FormModal isOpen={connectOpen} onClose={() => setConnectOpen(false)} title="Connect Instagram" maxWidth="max-w-md">
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label htmlFor="instagram-access-token" className={lbl}>Instagram Access Token *</label>
            <input id="instagram-access-token" name="accessToken" autoComplete="off"
              className={inpC} style={inpS} value={connectForm.accessToken}
              onChange={(e) => setConnectForm((p) => ({ ...p, accessToken: e.target.value }))}
              placeholder="Paste your long-lived access token" required />
            <p className="text-xs text-slate-400 mt-1.5">
              Generate a long-lived token from Meta Developer Portal. Valid for ~60 days.
            </p>
          </div>
          <div>
            <label htmlFor="instagram-username" className={lbl}>Instagram Username (optional)</label>
            <input id="instagram-username" name="username" autoComplete="username"
              className={inpC} style={inpS} value={connectForm.username}
              onChange={(e) => setConnectForm((p) => ({ ...p, username: e.target.value }))}
              placeholder="@username" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setConnectOpen(false)}
              className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100"
              style={{ border: '1px solid #E2E8F0' }}>Cancel</button>
            <button type="submit" disabled={connecting}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#E1306C,#833AB4)' }}>
              {connecting ? 'Connecting…' : 'Connect'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Manual post modal */}
      <FormModal
        isOpen={postOpen}
        onClose={() => setPostOpen(false)}
        title={postEditId ? 'Edit Post' : 'Add Post'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSavePost} className="space-y-4">
          <div>
            <label className={lbl}>Thumbnail / Image URL</label>
            <ImageUpload module="instagram" label="" value={postForm.thumbnailUrl || ''} onChange={(url) => setPostForm((p) => ({ ...p, thumbnailUrl: url, mediaUrl: url }))} contentId={postEditId || postReservedId} section="thumbnails" />
          </div>
          <div>
            <label htmlFor="post-caption" className={lbl}>Caption</label>
            <textarea id="post-caption" name="caption" autoComplete="off"
              className={inpC} style={inpS} rows={3}
              value={postForm.caption || ''}
              onChange={(e) => setPostForm((p) => ({ ...p, caption: e.target.value }))} />
          </div>
          <div>
            <label htmlFor="post-permalink" className={lbl}>Post Link (Permalink)</label>
            <input id="post-permalink" name="permalink" autoComplete="url"
              className={inpC} style={inpS} type="url" value={postForm.permalink || ''}
              onChange={(e) => setPostForm((p) => ({ ...p, permalink: e.target.value }))} />
          </div>
          <div>
            <label htmlFor="post-media-type" className={lbl}>Media Type</label>
            <select id="post-media-type" name="mediaType" autoComplete="off"
              className={inpC} style={inpS} value={postForm.mediaType || 'IMAGE'}
              onChange={(e) => setPostForm((p) => ({ ...p, mediaType: e.target.value }))}>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setPostOpen(false)}
              className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100"
              style={{ border: '1px solid #E2E8F0' }}>Cancel</button>
            <button type="submit" disabled={postSaving}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}>
              {postSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Disconnect confirm */}
      <ConfirmModal
        isOpen={disconnectOpen}
        title="Disconnect Instagram"
        message="This will remove your access token. Posts already synced will remain. Manual mode will be enabled."
        onConfirm={handleDisconnect}
        onCancel={() => setDisconnectOpen(false)}
        loading={disconnecting}
      />

      {/* Delete manual post confirm */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Post"
        message="This will permanently delete this post."
        onConfirm={handleDeletePost}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  )
}
