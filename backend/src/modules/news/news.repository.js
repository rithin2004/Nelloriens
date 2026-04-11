import { FirestoreRepo } from '../../utils/firestoreRepo.js'
import { db } from '../../config/firebase.js'

class NewsRepository extends FirestoreRepo {
  constructor() { super('news', { idPrefix: 'NEWS' }) }

  async searchByTitle(query) {
    const snap = await this.ref.orderBy('publishedAt', 'desc').get()
    const q    = query.toLowerCase()
    return snap.docs
      .map(d => ({ _id: d.id, ...d.data() }))
      .filter(n => n.title?.toLowerCase().includes(q) || n.slug?.toLowerCase().includes(q))
  }

  async batchPublish(ids) {
    return this.batchUpdate(ids, { publishedAt: new Date().toISOString() })
  }
}

class NewsCategoryRepository extends FirestoreRepo {
  constructor() { super('news_categories', { idPrefix: 'NCT' }) }
}

class BreakingPointRepository extends FirestoreRepo {
  constructor() { super('breaking_points', { idPrefix: 'BPT' }) }

  async findAllOrdered() {
    return this.findAll({ orderBy: 'order', order: 'asc' })
  }

  async getNextOrder() {
    const snap = await db.collection('breaking_points').orderBy('order', 'desc').limit(1).get()
    return snap.empty ? 0 : (snap.docs[0].data().order ?? 0) + 1
  }

  async reorder(items) {
    const batch = db.batch()
    items.forEach(({ id, order }) => {
      batch.update(db.collection('breaking_points').doc(id), { order })
    })
    await batch.commit()
  }
}

export const newsRepo     = new NewsRepository()
export const newsCatRepo  = new NewsCategoryRepository()
export const bpRepo       = new BreakingPointRepository()
