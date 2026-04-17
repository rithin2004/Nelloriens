import { db }     from '../../config/firebase.js'
import { badReq } from '../../utils/serviceBase.js'
import { isValidEmail, isValidPhone, isValidPincode, isValidUrl, isValidGaId, assert } from '../../utils/validators.js'

const COMPANY_DOC = 'config/company'

const ALLOWED_SOCIAL_KEYS = ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin', 'whatsapp', 'telegram']

export const companyService = {
  async get() {
    const snap = await db.doc(COMPANY_DOC).get()
    return snap.exists ? { ...snap.data(), _exists: true } : { _exists: false }
  },

  async create(data) {
    const { name, email, phone } = data
    assert(name?.trim(),  'Company name is required')
    assert(email?.trim(), 'Company email is required')
    assert(phone?.trim(), 'Company phone is required')
    assert(isValidEmail(email), 'Invalid email address')
    assert(isValidPhone(phone), 'Invalid phone number')

    if (data.supportEmail) assert(isValidEmail(data.supportEmail), 'Invalid support email address')
    if (data.website)      assert(isValidUrl(data.website),        'Website must be a valid URL (http/https)')
    if (data.pincode)      assert(isValidPincode(data.pincode),    'Pincode must be a valid 6-digit Indian pincode')
    if (data.gaId)         assert(isValidGaId(data.gaId),          'Google Analytics ID must be in format G-XXXXXXXXXX')

    if (data.socialLinks) {
      for (const [key, val] of Object.entries(data.socialLinks)) {
        assert(ALLOWED_SOCIAL_KEYS.includes(key), `Unknown social platform: ${key}`)
        if (val) assert(isValidUrl(val), `${key} must be a valid URL`)
      }
    }

    const existing = await db.doc(COMPANY_DOC).get()
    if (existing.exists) badReq('Company details already exist — use update instead')

    const now     = new Date().toISOString()
    const payload = { ...data, createdAt: now, updatedAt: now }
    await db.doc(COMPANY_DOC).set(payload)
    return payload
  },

  async update(data) {
    if (data.email)        assert(isValidEmail(data.email),        'Invalid email address')
    if (data.phone)        assert(isValidPhone(data.phone),        'Invalid phone number')
    if (data.supportEmail) assert(isValidEmail(data.supportEmail), 'Invalid support email address')
    if (data.website)      assert(isValidUrl(data.website),        'Website must be a valid URL (http/https)')
    if (data.pincode)      assert(isValidPincode(data.pincode),    'Pincode must be a valid 6-digit Indian pincode')
    if (data.gaId)         assert(isValidGaId(data.gaId),          'Google Analytics ID must be in format G-XXXXXXXXXX')

    if (data.socialLinks) {
      for (const [key, val] of Object.entries(data.socialLinks)) {
        assert(ALLOWED_SOCIAL_KEYS.includes(key), `Unknown social platform: ${key}`)
        if (val) assert(isValidUrl(val), `${key} must be a valid URL`)
      }
    }

    const now     = new Date().toISOString()
    const payload = { ...data, updatedAt: now }
    await db.doc(COMPANY_DOC).set(payload, { merge: true })
    return payload
  },
}
