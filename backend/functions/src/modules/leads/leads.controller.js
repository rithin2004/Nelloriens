import { leadsService, submitLead, updateLeadStatus } from './leads.service.js'
import { updateTracking } from '../../utils/userTracking.js'

export const leadsCtrl = {
  // Public — no auth
  async submit(req, res) {
    const lead = await submitLead(req.body)
    res.status(201).json({ success: true, message: 'Message received. We will get back to you shortly.', id: lead._id })
  },

  // Admin
  async list(req, res) {
    res.json({ success: true, ...(await leadsService.list(req.query)) })
  },

  async getById(req, res) {
    res.json(await leadsService.getById(req.params.id))
  },

  async update(req, res) {
    // If only status is being updated, use the validated status updater
    const keys = Object.keys(req.body)
    let data
    if (keys.length === 1 && keys[0] === 'status') {
      data = await updateLeadStatus(req.params.id, req.body.status)
    } else {
      data = await leadsService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
    }
    res.json({ success: true, data })
  },

  async remove(req, res) {
    await leadsService.remove(req.params.id)
    res.json({ success: true, message: 'Lead deleted' })
  },

  // ── View increments (RULE 11 — public, no auth) ──────────────────────────
  async incrementPageViews(req, res) {
    await leadsService.incrementViews(req.params.id, 'pageViews')
    res.json({ success: true })
  },
  async incrementCardViews(req, res) {
    await leadsService.incrementViews(req.params.id, 'cardViews')
    res.json({ success: true })
  },
}
