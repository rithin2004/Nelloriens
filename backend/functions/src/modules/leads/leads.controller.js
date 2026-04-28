import { leadsService, submitLead, updateLeadStatus, leadInquiryTypeService } from './leads.service.js'
import { updateTracking } from '../../utils/userTracking.js'

export const inquiryTypeCtrl = {
  async list(req, res) {
    const data = await leadInquiryTypeService.list()
    res.json({ success: true, message: 'OK', data })
  },
  async create(req, res) {
    const data = await leadInquiryTypeService.create(req.body.name)
    res.status(201).json({ success: true, message: 'Created', data })
  },
  async update(req, res) {
    const data = await leadInquiryTypeService.update(req.params.id, req.body.name)
    res.json({ success: true, message: 'Updated', data })
  },
  async remove(req, res) {
    await leadInquiryTypeService.remove(req.params.id)
    res.json({ success: true, message: 'Deleted', data: null })
  },
}

export const leadsCtrl = {
  // Public — no auth
  async submit(req, res) {
    const lead = await submitLead(req.body)
    res.status(201).json({ success: true, message: 'Message received. We will get back to you shortly.', data: { id: lead._id } })
  },

  // Admin
  async list(req, res) {
    const { items, total, page, totalPages } = await leadsService.list(req.query)
    res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
  },

  async getById(req, res) {
    const data = await leadsService.getById(req.params.id)
    res.json({ success: true, message: 'OK', data })
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
    res.json({ success: true, message: 'Updated', data })
  },

  async remove(req, res) {
    await leadsService.remove(req.params.id)
    res.json({ success: true, message: 'Lead deleted', data: null })
  },

  // ── View increments (RULE 11 — public, no auth) ──────────────────────────
  async incrementPageViews(req, res) {
    await leadsService.incrementViews(req.params.id, 'pageViews')
    res.json({ success: true, message: 'OK' })
  },
  async incrementCardViews(req, res) {
    await leadsService.incrementViews(req.params.id, 'cardViews')
    res.json({ success: true, message: 'OK' })
  },
}
