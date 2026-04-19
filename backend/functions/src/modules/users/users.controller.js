import { usersService }  from './users.service.js'
import { db }             from '../../config/firebase.js'

export const usersCtrl = {
  /** GET /users/me — returns the calling user's own doc + role permissions */
  async me(req, res) {
    const snaps = await db.collection('users').where('firebaseUid', '==', req.user.uid).limit(1).get()
    if (snaps.empty) return res.status(404).json({ success: false, message: 'User not found' })
    const doc  = snaps.docs[0]
    const data = { _id: doc.id, ...doc.data() }

    // Attach role permissions so the frontend can gate features locally
    if (data.roleId) {
      const roleSnap = await db.collection('roles').doc(data.roleId).get()
      if (roleSnap.exists) data.permissions = roleSnap.data().permissions || {}
    }

    res.json({ success: true, message: 'OK', data })
  },

  /** PATCH /users/me — update own name and/or phone */
  async updateMe(req, res) {
    const data = await usersService.updateMe(req.user.uid, req.body)
    res.json({ success: true, message: 'Profile updated', data })
  },

  async list(req, res) {
    const { items, total, page, totalPages } = await usersService.list(req.query)
    res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
  },

  async getById(req, res) {
    const data = await usersService.getById(req.params.id)
    res.json({ success: true, message: 'OK', data })
  },

  async create(req, res) {
    const result = await usersService.create(req.body)
    res.status(201).json({ success: true, message: 'User created. Password setup email sent.', data: { user: result.user, resetLink: result.resetLink } })
  },

  async update(req, res) {
    const data = await usersService.update(req.params.id, req.body)
    res.json({ success: true, message: 'Updated', data })
  },

  async remove(req, res) {
    await usersService.remove(req.params.id)
    res.json({ success: true, message: 'User deleted', data: null })
  },

  async getResetLink(req, res) {
    const result = await usersService.generateResetLink(req.params.id)
    res.json({ success: true, message: 'OK', data: { resetLink: result.resetLink } })
  },
}
