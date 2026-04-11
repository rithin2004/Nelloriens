import { adsRepo }          from './ads.repository.js'
import { CrudService, badReq } from '../../utils/serviceBase.js'
import { db }              from '../../config/firebase.js'

const ADS_CONFIG_DOC = 'config/adsense'

// ── Manual Ads CRUD ────────────────────────────────────────────────────────
export const adsService = new CrudService(adsRepo, {
  entityName:   'Ad',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ position, active }) => {
    const f = []
    if (position)           f.push(['position', '==', position])
    if (active === 'true')  f.push(['active',   '==', true])
    if (active === 'false') f.push(['active',   '==', false])
    return f
  },
})

// ── AdSense Settings ───────────────────────────────────────────────────────
export const adsenseService = {
  async getSettings() {
    const snap = await db.doc(ADS_CONFIG_DOC).get()
    const cfg  = snap.exists ? snap.data() : {}
    return {
      connected:    !!cfg.publisherId,
      publisherId:  cfg.publisherId  || null,
      autoAdsEnabled: cfg.autoAdsEnabled ?? false,
      manualAdsEnabled: !cfg.publisherId,  // manual ads disabled when AdSense connected
      connectedAt:  cfg.connectedAt  || null,
      updatedAt:    cfg.updatedAt    || null,
    }
  },

  async connect(data) {
    const { publisherId, autoAdsEnabled = false } = data
    if (!publisherId?.trim()) badReq('publisherId is required (e.g. ca-pub-XXXXXXXXXXXXXXXX)')
    const now = new Date().toISOString()
    const payload = {
      publisherId:    publisherId.trim(),
      autoAdsEnabled: !!autoAdsEnabled,
      connectedAt:    now,
      updatedAt:      now,
    }
    await db.doc(ADS_CONFIG_DOC).set(payload, { merge: true })
    return { connected: true, publisherId: payload.publisherId }
  },

  async update(data) {
    const snap = await db.doc(ADS_CONFIG_DOC).get()
    if (!snap.exists || !snap.data().publisherId) badReq('AdSense not connected')
    const payload = { ...data, updatedAt: new Date().toISOString() }
    await db.doc(ADS_CONFIG_DOC).set(payload, { merge: true })
    return payload
  },

  async disconnect() {
    await db.doc(ADS_CONFIG_DOC).set({
      publisherId:    null,
      autoAdsEnabled: false,
      updatedAt:      new Date().toISOString(),
    }, { merge: true })
    return { connected: false }
  },
}
