import { db }     from '../../config/firebase.js'
import { badReq } from '../../utils/serviceBase.js'

const COMPANY_DOC = 'config/company'

/**
 * Required fields for the company document:
 *   name, email, phone
 * Optional:
 *   tagline, description, address, city, state, pincode, country,
 *   website, logoUrl, faviconUrl, socialLinks (object),
 *   businessHours (object), mapEmbedUrl
 */
export const companyService = {
  async get() {
    const snap = await db.doc(COMPANY_DOC).get()
    return snap.exists ? { ...snap.data(), _exists: true } : { _exists: false }
  },

  async create(data) {
    const { name, email, phone } = data
    if (!name?.trim())  badReq('Company name is required')
    if (!email?.trim()) badReq('Company email is required')
    if (!phone?.trim()) badReq('Company phone is required')

    const existing = await db.doc(COMPANY_DOC).get()
    if (existing.exists) badReq('Company details already exist — use update instead')

    const now     = new Date().toISOString()
    const payload = { ...data, createdAt: now, updatedAt: now }
    await db.doc(COMPANY_DOC).set(payload)
    return payload
  },

  async update(data) {
    const now     = new Date().toISOString()
    const payload = { ...data, updatedAt: now }
    await db.doc(COMPANY_DOC).set(payload, { merge: true })
    return payload
  },
}
