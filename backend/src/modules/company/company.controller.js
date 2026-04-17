import { companyService } from './company.service.js'
import { log } from '../../utils/auditLog.js'

export const companyCtrl = {
  async get(req, res) {
    res.json(await companyService.get())
  },

  async create(req, res) {
    const data = await companyService.create(req.body)
    await log(req, 'create', 'company', 'profile', { name: data.name })
    res.status(201).json({ success: true, data })
  },

  async update(req, res) {
    const data = await companyService.update(req.body)
    await log(req, 'update', 'company', 'profile')
    res.json({ success: true, data })
  },
}
