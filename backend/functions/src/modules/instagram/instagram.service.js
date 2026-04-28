import { instagramRepo }     from './instagram.repository.js'
import { badReq, notFound } from '../../utils/serviceBase.js'
import { db }               from '../../config/firebase.js'
import { getLimits }        from '../../utils/limits.js'

const IG_CONFIG_DOC = 'config/instagram'

async function getConfig() {
  const snap = await db.doc(IG_CONFIG_DOC).get()
  return snap.exists ? snap.data() : {}
}

export const instagramService = {
  // ── Status / Settings ──────────────────────────────────────────────────

  async getStatus() {
    const cfg = await getConfig()
    return {
      connected:   !!cfg.accessToken,
      username:    cfg.username    || null,
      tokenExpiry: cfg.tokenExpiry || null,
      lastSync:    cfg.lastSync    || null,
    }
  },

  async getSettings() {
    const cfg = await getConfig()
    // Never expose the raw access token in the response
    return {
      connected:    !!cfg.accessToken,
      username:     cfg.username     || null,
      tokenExpiry:  cfg.tokenExpiry  || null,
      lastSync:     cfg.lastSync     || null,
      manualMode:   !cfg.accessToken,     // manual posts enabled when not connected
    }
  },

  async connect(data) {
    const { accessToken, username } = data
    if (!accessToken?.trim()) badReq('accessToken is required')
    const now     = new Date().toISOString()
    const expiry  = new Date(Date.now() + 5184000 * 1000).toISOString() // ~60 days default
    const payload = {
      accessToken:  accessToken.trim(),
      username:     username?.trim() || '',
      tokenExpiry:  expiry,
      connectedAt:  now,
      updatedAt:    now,
    }
    await db.doc(IG_CONFIG_DOC).set(payload, { merge: true })
    return { connected: true, username: payload.username, tokenExpiry: payload.tokenExpiry }
  },

  async disconnect() {
    await db.doc(IG_CONFIG_DOC).set({
      accessToken:  null,
      username:     null,
      tokenExpiry:  null,
      updatedAt:    new Date().toISOString(),
    }, { merge: true })
    return { connected: false }
  },

  // ── Posts ──────────────────────────────────────────────────────────────

  async getPosts() {
    return instagramRepo.findAll({ orderBy: 'timestamp', order: 'desc' })
  },

  async sync() {
    const cfg = await getConfig()
    if (!cfg.accessToken) badReq('Instagram not connected. Set access token first.')

    const syncUrl = new URL('https://graph.instagram.com/me/media')
    syncUrl.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp')
    syncUrl.searchParams.set('access_token', cfg.accessToken)
    const resp = await fetch(syncUrl.toString())
    if (!resp.ok) badReq('Failed to fetch Instagram posts')
    const json = await resp.json()
    if (json.error) badReq(json.error.message || 'Instagram API error')

    const posts = (json.data || []).filter(p => p.media_type !== 'CAROUSEL_ALBUM')
    const batch = db.batch()
    const col   = db.collection('instagram_posts')

    for (const post of posts) {
      const ref = col.doc(post.id)
      batch.set(ref, {
        igId:      post.id,
        caption:   post.caption   || '',
        mediaType: post.media_type,
        mediaUrl:  post.media_url || post.thumbnail_url || '',
        permalink: post.permalink,
        timestamp: post.timestamp,
        hidden:    false,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    }
    await batch.commit()
    await db.doc(IG_CONFIG_DOC).set({ lastSync: new Date().toISOString() }, { merge: true })

    return { synced: posts.length }
  },

  // Manual post management (when Instagram not connected)
  async createPost(data) {
    const cfg = await getConfig()
    if (cfg.accessToken) badReq('Instagram is connected — use sync to import posts')
    // RULE 40 — max manual posts (configurable via Settings)
    const { maxInstagramPosts } = await getLimits()
    const existing = await instagramRepo.findAll({})
    if (existing.length >= maxInstagramPosts) {
      const err = new Error(`Maximum ${maxInstagramPosts} Instagram posts allowed. Remove one before adding a new one.`)
      err.status       = 409
      err.code         = 'MAX_LIMIT_REACHED'
      err.currentItems = existing
      throw err
    }
    const { _reservedId, ...rest } = data
    return instagramRepo.create(rest, _reservedId || null)
  },

  async updatePost(id, data) {
    const cfg = await getConfig()
    if (cfg.accessToken) badReq('Instagram is connected — manual editing is disabled')
    const existing = await instagramRepo.findById(id)
    if (!existing) notFound('Post not found')
    return instagramRepo.update(id, data)
  },

  async incrementViews(id, field) {
    await instagramRepo.incrementField(id, field)
  },

  async hidePost(id, requestUser = null) {
    const item = await instagramRepo.findById(id)
    if (!item) notFound('Post not found')
    await instagramRepo.softDelete(id, {
      deletedBy: requestUser?.uid || null,
      reason:    'manual',
    })
  },

  async refreshToken() {
    const cfg = await getConfig()
    if (!cfg.accessToken) badReq('Instagram not connected')

    const refreshUrl = new URL('https://graph.instagram.com/refresh_access_token')
    refreshUrl.searchParams.set('grant_type', 'ig_refresh_token')
    refreshUrl.searchParams.set('access_token', cfg.accessToken)
    const resp = await fetch(refreshUrl.toString())
    if (!resp.ok) badReq('Failed to refresh token')
    const json = await resp.json()
    if (json.error) badReq(json.error.message || 'Instagram token refresh failed')

    const expiry = new Date(Date.now() + (json.expires_in || 5184000) * 1000).toISOString()
    await db.doc(IG_CONFIG_DOC).set({
      accessToken:  json.access_token,
      tokenExpiry:  expiry,
      updatedAt:    new Date().toISOString(),
    }, { merge: true })

    return { tokenExpiry: expiry }
  },
}
