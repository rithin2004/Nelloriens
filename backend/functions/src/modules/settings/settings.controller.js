import { siteConfigService, auditLogsService } from './settings.service.js'

export const siteCtrl = {
  async get(req, res) {
    const data = await siteConfigService.get()
    res.json({ success: true, message: 'OK', data })
  },
  async update(req, res) {
    const data = await siteConfigService.update(req.body)
    res.json({ success: true, message: 'Updated', data })
  },
}

export const auditCtrl = {
  async list(req, res) {
    const { items, total, page, totalPages } = await auditLogsService.list(req.query)
    res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
  },
}
