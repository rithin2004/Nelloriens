import { db } from '../../config/firebase.js'

const SITE_DOC = 'config/site'

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
