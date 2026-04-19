import { getSetupStatus, createSuperadmin } from './setup.service.js'

export const setupCtrl = {
  async status(req, res) {
    const data = await getSetupStatus()
    res.json({ success: true, message: 'OK', data })
  },

  async bootstrap(req, res) {
    const result = await createSuperadmin(req.body)
    res.status(201).json({
      success: true,
      message: 'Superadmin created. A password-set email has been sent to their inbox.',
      data:    { user: result.user },
    })
  },
}
