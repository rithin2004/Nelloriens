import { db }                                       from '../../config/firebase.js'
import { getLimits, parseLimitsPayload, LIMIT_DEFAULTS, invalidateLimitsCache } from '../../utils/limits.js'

const LIMITS_DOC = 'config/limits'

export const limitsService = {
  async get() {
    const current = await getLimits()
    return { limits: current, defaults: LIMIT_DEFAULTS }
  },

  async update(body) {
    const payload = parseLimitsPayload(body)
    await db.doc(LIMITS_DOC).set({ ...payload, updatedAt: new Date().toISOString() }, { merge: true })
    invalidateLimitsCache()
    const updated = await getLimits()
    return { limits: updated, defaults: LIMIT_DEFAULTS }
  },
}
