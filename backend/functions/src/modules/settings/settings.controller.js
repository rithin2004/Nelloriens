import { siteConfigService, auditLogsService } from './settings.service.js'

export const siteCtrl = {
  async get(req, res) {
    res.json(await siteConfigService.get())
  },
  async update(req, res) {
    const data = await siteConfigService.update(req.body)
    res.json({ success: true, data })
  },
}

export const auditCtrl = {
  async list(req, res) {
    res.json({ success: true, ...(await auditLogsService.list(req.query)) })
  },
}
