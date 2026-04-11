import { companyService } from './company.service.js'

export const companyCtrl = {
  async get(req, res) {
    res.json(await companyService.get())
  },

  async create(req, res) {
    const data = await companyService.create(req.body)
    res.status(201).json({ success: true, data })
  },

  async update(req, res) {
    const data = await companyService.update(req.body)
    res.json({ success: true, data })
  },
}
