import { instagramService } from './instagram.service.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

export const instagramCtrl = {
  // Settings
  async getSettings(req, res) {
    res.json(await instagramService.getSettings())
  },
  async connect(req, res) {
    const data = await instagramService.connect(req.body)
    res.json({ success: true, data })
  },
  async disconnect(req, res) {
    const data = await instagramService.disconnect()
    res.json({ success: true, data })
  },

  // Posts
  async getStatus(req, res) {
    res.json(await instagramService.getStatus())
  },
  async getPosts(req, res) {
    res.json(await instagramService.getPosts())
  },
  async sync(req, res) {
    res.json({ success: true, ...(await instagramService.sync()) })
  },
  async createPost(req, res) {
    const data = await instagramService.createPost({ ...req.body, ...createTracking(req.user) })
    res.status(201).json({ success: true, data })
  },
  async updatePost(req, res) {
    const data = await instagramService.updatePost(req.params.id, { ...req.body, ...updateTracking(req.user) })
    res.json({ success: true, data })
  },
  async hidePost(req, res) {
    await instagramService.hidePost(req.params.id)
    res.json({ success: true, message: 'Removed' })
  },
  async refreshToken(req, res) {
    const data = await instagramService.refreshToken()
    res.json({ success: true, data })
  },

  // ── Count increments (RULE 11 — public, no auth) ────────────────────────
  async incrementPageViews(req, res) {
    await instagramService.incrementViews(req.params.id, 'pageViews')
    res.json({ success: true })
  },
  async incrementCardViews(req, res) {
    await instagramService.incrementViews(req.params.id, 'cardViews')
    res.json({ success: true })
  },
  async incrementImpressions(req, res) {
    await instagramService.incrementViews(req.params.id, 'impressions')
    res.json({ success: true })
  },
  async incrementTouches(req, res) {
    await instagramService.incrementViews(req.params.id, 'touches')
    res.json({ success: true })
  },
}
