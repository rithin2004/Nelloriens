import { adminsService, siteConfigService, auditLogsService } from './settings.service.js'
import { handleErr } from '../../utils/serviceBase.js'

export const adminsCtrl = {
  async list(req, res) {
    try { res.json({ success: true, data: await adminsService.list() }) }
    catch (err) { handleErr(res, err) }
  },
  async create(req, res) {
    try { res.status(201).json({ success: true, data: await adminsService.create(req.body) }) }
    catch (err) { handleErr(res, err) }
  },
  async update(req, res) {
    try { res.json({ success: true, data: await adminsService.update(req.params.id, req.body) }) }
    catch (err) { handleErr(res, err) }
  },
  async remove(req, res) {
    try { await adminsService.remove(req.params.id); res.json({ success: true, message: 'Deleted' }) }
    catch (err) { handleErr(res, err) }
  },
}

export const siteCtrl = {
  async get(req, res) {
    try { res.json({ success: true, data: await siteConfigService.get() }) }
    catch (err) { handleErr(res, err) }
  },
  async update(req, res) {
    try { res.json({ success: true, data: await siteConfigService.update(req.body) }) }
    catch (err) { handleErr(res, err) }
  },
}

export const auditCtrl = {
  async list(req, res) {
    try { res.json({ success: true, ...(await auditLogsService.list(req.query)) }) }
    catch (err) { handleErr(res, err) }
  },
}
