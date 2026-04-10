import { db, auth } from '../../config/firebase.js'
import { badReq, notFound } from '../../utils/serviceBase.js'

const SITE_DOC = 'config/site'

// ── Admins ─────────────────────────────────────────────────────────────────
export const adminsService = {
  async list() {
    const snap = await db.collection('admins').orderBy('createdAt', 'desc').get()
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
  },

  async create(data) {
    const { email, password, name, role = 'admin', permissions = {} } = data
    if (!email || !password || !name) badReq('email, password, and name are required')

    // Create Firebase Auth user
    const userRecord = await auth.createUser({ email, password, displayName: name })

    const now = new Date().toISOString()
    const adminData = { email, name, role, permissions, active: true, createdAt: now, updatedAt: now }
    await db.collection('admins').doc(userRecord.uid).set(adminData)

    return { _id: userRecord.uid, ...adminData }
  },

  async update(id, data) {
    const snap = await db.collection('admins').doc(id).get()
    if (!snap.exists) notFound('Admin not found')

    const { password, ...rest } = data

    if (password) {
      await auth.updateUser(id, { password })
    }
    if (rest.email) {
      await auth.updateUser(id, { email: rest.email })
    }
    if (rest.name) {
      await auth.updateUser(id, { displayName: rest.name })
    }

    const updated = { ...rest, updatedAt: new Date().toISOString() }
    await db.collection('admins').doc(id).update(updated)
    return updated
  },

  async remove(id) {
    const snap = await db.collection('admins').doc(id).get()
    if (!snap.exists) notFound('Admin not found')
    await Promise.all([
      auth.deleteUser(id),
      db.collection('admins').doc(id).delete(),
    ])
  },
}

// ── Site Config ────────────────────────────────────────────────────────────
export const siteConfigService = {
  async get() {
    const snap = await db.doc(SITE_DOC).get()
    return snap.exists ? snap.data() : {}
  },
  async update(data) {
    const payload = { ...data, updatedAt: new Date().toISOString() }
    await db.doc(SITE_DOC).set(payload, { merge: true })
    return payload
  },
}

// ── Audit Logs ─────────────────────────────────────────────────────────────
export const auditLogsService = {
  async list(query = {}) {
    const { page = 1, limit = 20 } = query
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100)
    const safePage  = Math.max(parseInt(page) || 1, 1)
    const offset    = (safePage - 1) * safeLimit

    const [countSnap, snap] = await Promise.all([
      db.collection('audit_logs').count().get(),
      db.collection('audit_logs').orderBy('createdAt', 'desc').offset(offset).limit(safeLimit).get(),
    ])
    const total = countSnap.data().count
    return {
      items:      snap.docs.map(d => ({ _id: d.id, ...d.data() })),
      total,
      page:       safePage,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    }
  },
}
