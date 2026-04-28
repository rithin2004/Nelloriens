import { limitsService } from './settings.service.js'

export const limitsCtrl = {
  async get(req, res) {
    const data = await limitsService.get()
    res.json({ success: true, message: 'OK', data })
  },

  async update(req, res) {
    const data = await limitsService.update(req.body)
    res.json({ success: true, message: 'Limits updated', data })
  },
}
