import { usersRepo }          from './users.repository.js'
import { db, auth }           from '../../config/firebase.js'
import { badReq, notFound, forbidden } from '../../utils/serviceBase.js'

const SUPERADMIN_USER_ID = 'USR00001'
const SUPERADMIN_ROLE_ID = 'ROL00001'

export const usersService = {
  /**
   * Update the calling user's own profile.
   * Only name and phone are editable — email and role changes are admin-only.
   */
  async updateMe(firebaseUid, data) {
    const snaps = await db.collection('users').where('firebaseUid', '==', firebaseUid).limit(1).get()
    if (snaps.empty) notFound('User not found')

    const doc = snaps.docs[0]
    const updates = {}

    if (data.name  !== undefined) updates.name  = data.name.trim()
    if (data.phone !== undefined) updates.phone = data.phone.trim()

    if (!Object.keys(updates).length) badReq('Nothing to update')

    // Keep Firebase Auth displayName in sync
    if (updates.name) {
      await auth.updateUser(firebaseUid, { displayName: updates.name })
    }

    return usersRepo.update(doc.id, updates)
  },

  async list(query = {}) {
    const { page = 1, limit = 20, search = '' } = query
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100)
    const safePage  = Math.max(parseInt(page)  || 1, 1)

    let items = await usersRepo.findAll({ orderBy: 'createdAt', order: 'desc' })

    if (search) {
      const q = search.toLowerCase()
      items = items.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    }

    const total = items.length
    return {
      items:      items.slice((safePage - 1) * safeLimit, safePage * safeLimit),
      total,
      page:       safePage,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    }
  },

  async getById(id) {
    const user = await usersRepo.findById(id)
    if (!user) notFound('User not found')
    return user
  },

  /**
   * Create a new admin user.
   * - Creates Firebase Auth account (no password — user sets via reset link)
   * - Generates password reset link
   * - Creates user doc in `users` collection with sequential ID (USRxxxxx)
   * Returns the user doc + resetLink for display.
   */
  async create(data) {
    const { email, name, roleId, phone = '' } = data
    if (!email?.trim()) badReq('email is required')
    if (!name?.trim())  badReq('name is required')
    if (!roleId)        badReq('roleId is required')

    // Only one superadmin is allowed — prevent assigning the superadmin role to new users
    if (roleId === SUPERADMIN_ROLE_ID) forbidden('Cannot assign the superadmin role to new users')

    const normalEmail = email.trim().toLowerCase()

    // Verify role exists
    const roleSnap = await db.collection('roles').doc(roleId).get()
    if (!roleSnap.exists) badReq(`Role ${roleId} not found`)

    // Create Firebase Auth user without password
    let userRecord
    try {
      userRecord = await auth.createUser({
        email:       normalEmail,
        displayName: name.trim(),
      })
    } catch (err) {
      // Surface Firebase-specific errors (e.g. email already exists) as 400
      badReq(err.message || 'Failed to create Firebase Auth account')
    }

    // Generate password reset/set link
    let resetLink
    try {
      resetLink = await auth.generatePasswordResetLink(normalEmail)
    } catch {
      // Non-fatal — clean up and surface error
      await auth.deleteUser(userRecord.uid).catch(() => {})
      badReq('Failed to generate password reset link')
    }

    // Create Firestore user doc with sequential ID
    // If this fails, roll back the Firebase Auth account so state stays consistent
    let user
    try {
      const now = new Date().toISOString()
      user = await usersRepo.create({
        firebaseUid: userRecord.uid,
        email:       normalEmail,
        name:        name.trim(),
        phone:       phone.trim(),
        roleId,
        roleName:    roleSnap.data().name || '',
        active:      true,
        createdAt:   now,
        updatedAt:   now,
      })
    } catch (err) {
      await auth.deleteUser(userRecord.uid).catch(() => {})
      throw err
    }

    return { user, resetLink }
  },

  async update(id, data) {
    const existing = await usersRepo.findById(id)
    if (!existing) notFound('User not found')

    const { name, phone, roleId, active } = data
    const updates = {}

    // Superadmin user: role and active status are locked
    if (id === SUPERADMIN_USER_ID) {
      if (roleId !== undefined) forbidden('Superadmin role cannot be changed')
      if (active !== undefined && Boolean(active) === false) forbidden('Superadmin account cannot be deactivated')
    }

    if (name     !== undefined) updates.name   = name.trim()
    if (phone    !== undefined) updates.phone  = phone.trim()
    if (active   !== undefined) updates.active = Boolean(active)
    if (roleId   !== undefined) {
      // No other user can be assigned the superadmin role
      if (roleId === SUPERADMIN_ROLE_ID) forbidden('Cannot assign the superadmin role')
      const roleSnap = await db.collection('roles').doc(roleId).get()
      if (!roleSnap.exists) badReq(`Role ${roleId} not found`)
      updates.roleId   = roleId
      updates.roleName = roleSnap.data().name || ''
    }

    // Sync Firebase Auth displayName if name changed
    if (updates.name && existing.firebaseUid) {
      await auth.updateUser(existing.firebaseUid, { displayName: updates.name })
    }

    return usersRepo.update(id, updates)
  },

  async remove(id) {
    if (id === SUPERADMIN_USER_ID) forbidden('Superadmin user cannot be deleted')
    const existing = await usersRepo.findById(id)
    if (!existing) notFound('User not found')

    if (existing.firebaseUid) {
      await auth.deleteUser(existing.firebaseUid).catch(() => {})
    }
    await usersRepo.delete(id)
    return existing
  },

  /** Generate a new password reset link for the user */
  async generateResetLink(id) {
    const user = await usersRepo.findById(id)
    if (!user) notFound('User not found')
    const resetLink = await auth.generatePasswordResetLink(user.email)
    return { resetLink }
  },
}
