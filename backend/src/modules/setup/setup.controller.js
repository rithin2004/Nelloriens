import { getSetupStatus, createSuperadmin } from './setup.service.js'

export const setupCtrl = {
  async status(req, res) {
    const status = await getSetupStatus()
    res.json(status)
  },

  async bootstrap(req, res) {
    const result = await createSuperadmin(req.body)
    res.status(201).json({
      success:   true,
      message:   'Superadmin created. Share the reset link so they can set their password.',
      user:      result.user,
      resetLink: result.resetLink,
    })
  },
}
