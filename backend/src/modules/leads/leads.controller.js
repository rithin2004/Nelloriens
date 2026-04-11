import { leadsService, submitLead } from './leads.service.js'

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
    const data = await leadsService.update(req.params.id, req.body)
    res.json({ success: true, data })
  },

  async remove(req, res) {
    await leadsService.remove(req.params.id)
    res.json({ success: true, message: 'Lead deleted' })
  },
}
