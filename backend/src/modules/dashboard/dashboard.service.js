import { db } from '../../config/firebase.js'

const collections = ['news', 'jobs', 'results', 'sports', 'foods', 'history',
                     'stays', 'events', 'movies', 'transport', 'offers', 'tourism',
                     'updates', 'ads', 'sponsorships']

export const dashboardService = {
  async getStats() {
    const counts = await Promise.all(
      collections.map(async col => {
        const snap = await db.collection(col).count().get()
        return [col, snap.data().count]
      })
    )
    const leadsSnap = await db.collection('contact_messages').count().get()
    return {
      ...Object.fromEntries(counts),
      leads: leadsSnap.data().count,
    }
  },

  async getActivity(query = {}) {
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

  async getRecentLeads() {
    const snap = await db.collection('contact_messages').orderBy('createdAt', 'desc').limit(5).get()
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
  },

  async getRecentUpdates() {
    const snap = await db.collection('updates').orderBy('createdAt', 'desc').limit(5).get()
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
  },

  async getFeatured() {
    const [news, events, tourism] = await Promise.all([
      db.collection('news').where('featured', '==', true).limit(5).get(),
      db.collection('events').where('featured', '==', true).limit(5).get(),
      db.collection('tourism').where('featured', '==', true).limit(5).get(),
    ])
    return {
      news:    news.docs.map(d    => ({ _id: d.id, ...d.data() })),
      events:  events.docs.map(d  => ({ _id: d.id, ...d.data() })),
      tourism: tourism.docs.map(d => ({ _id: d.id, ...d.data() })),
    }
  },
}
