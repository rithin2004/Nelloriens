import { settingsService, messagesService } from './contact.service.js'
import { handleErr }                        from '../../utils/serviceBase.js'

// ── Settings ───────────────────────────────────────────────────────────────
export const settingsCtrl = {
  async get(req, res) {
    try { res.json({ success: true, data: await settingsService.get() }) }
    catch (err) { handleErr(res, err) }
  },
  async update(req, res) {
    try { res.json({ success: true, data: await settingsService.update(req.body) }) }
    catch (err) { handleErr(res, err) }
  },
}

// ── Messages (leads) ───────────────────────────────────────────────────────
export const messagesCtrl = {
  async list(req, res) {
    try { res.json({ success: true, ...(await messagesService.list(req.query)) }) }
    catch (err) { handleErr(res, err) }
  },
  async getById(req, res) {
    try { res.json({ success: true, data: await messagesService.getById(req.params.id) }) }
    catch (err) { handleErr(res, err) }
  },
  async updateStatus(req, res) {
    try { res.json({ success: true, data: await messagesService.updateStatus(req.params.id, req.body.status) }) }
    catch (err) { handleErr(res, err) }
  },
  async remove(req, res) {
    try { await messagesService.remove(req.params.id); res.json({ success: true, message: 'Deleted' }) }
    catch (err) { handleErr(res, err) }
  },
}
