import { messagesRepo }           from './contact.repository.js'
import { badReq, notFound }       from '../../utils/serviceBase.js'
import { db }                     from '../../config/firebase.js'

const SETTINGS_DOC = 'config/contact_settings'

// ── Settings (single document) ─────────────────────────────────────────────
export const settingsService = {
  async get() {
    const snap = await db.doc(SETTINGS_DOC).get()
    return snap.exists ? snap.data() : {}
  },
  async update(data) {
    await db.doc(SETTINGS_DOC).set({ ...data, updatedAt: new Date().toISOString() }, { merge: true })
    return data
  },
}

// ── Messages (leads) ───────────────────────────────────────────────────────
export const messagesService = {
  async list(query = {}) {
    const { page = 1, limit = 20 } = query
    return messagesRepo.paginate({ page, limit, orderBy: 'createdAt', order: 'desc' })
  },
  async getById(id) {
    const item = await messagesRepo.findById(id)
    if (!item) notFound('Message not found')
    return item
  },
  async updateStatus(id, status) {
    if (!status) badReq('status is required')
    const item = await messagesRepo.findById(id)
    if (!item) notFound('Message not found')
    return messagesRepo.update(id, { status })
  },
  async remove(id) {
    const item = await messagesRepo.findById(id)
    if (!item) notFound('Message not found')
    await messagesRepo.delete(id)
  },
}
