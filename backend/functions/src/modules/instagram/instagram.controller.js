import { instagramService } from './instagram.service.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

export const instagramCtrl = {
  // Settings
  async getSettings(req, res) {
    const data = await instagramService.getSettings()
    res.json({ success: true, message: 'OK', data })
  },
  async connect(req, res) {
    const data = await instagramService.connect(req.body)
    res.json({ success: true, message: 'Connected', data })
  },
  async disconnect(req, res) {
    const data = await instagramService.disconnect()
    res.json({ success: true, message: 'Disconnected', data })
  },

  // Posts
  async getStatus(req, res) {
    const data = await instagramService.getStatus()
    res.json({ success: true, message: 'OK', data })
  },
  async getPosts(req, res) {
    const data = await instagramService.getPosts()
    res.json({ success: true, message: 'OK', data })
  },
  async sync(req, res) {
    const data = await instagramService.sync()
    res.json({ success: true, message: 'Synced', data })
  },
  async createPost(req, res) {
    const data = await instagramService.createPost({ ...req.body, ...createTracking(req.user) })
    res.status(201).json({ success: true, message: 'Created', data })
  },
  async updatePost(req, res) {
    const data = await instagramService.updatePost(req.params.id, { ...req.body, ...updateTracking(req.user) })
    res.json({ success: true, message: 'Updated', data })
  },
  async hidePost(req, res) {
    await instagramService.hidePost(req.params.id)
    res.json({ success: true, message: 'Removed', data: null })
  },
  async refreshToken(req, res) {
    const data = await instagramService.refreshToken()
    res.json({ success: true, message: 'Token refreshed', data })
  },

  // ── Count increments (RULE 11 — public, no auth) ────────────────────────
  async incrementPageViews(req, res) {
    await instagramService.incrementViews(req.params.id, 'pageViews')
    res.json({ success: true, message: 'OK' })
  },
  async incrementCardViews(req, res) {
    await instagramService.incrementViews(req.params.id, 'cardViews')
    res.json({ success: true, message: 'OK' })
  },
  async incrementImpressions(req, res) {
    await instagramService.incrementViews(req.params.id, 'impressions')
    res.json({ success: true, message: 'OK' })
  },
  async incrementTouches(req, res) {
    await instagramService.incrementViews(req.params.id, 'touches')
    res.json({ success: true, message: 'OK' })
  },
}
