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
    // Use last item's order + 1 (not count) so a gap caused by any data
    // inconsistency can never produce a collision on the next insert.
    const all = await this.findAllOrdered()
    return all.length === 0 ? 1 : all[all.length - 1].order + 1
  }

  // Reassign orders 1, 2, 3… to all remaining items after a deletion.
  async resequence() {
    const all   = await this.findAllOrdered()
    if (all.length === 0) return
    const batch = db.batch()
    const now   = new Date().toISOString()
    all.forEach((item, idx) => {
      batch.update(db.collection('breaking_points').doc(item._id), { order: idx + 1, updatedAt: now })
    })
    await batch.commit()
  }

  // Accept an ordered array of IDs; backend assigns order = position + 1.
  async reorder(ids) {
    if (!ids.length) return
    const batch = db.batch()
    const now   = new Date().toISOString()
    ids.forEach((id, idx) => {
      batch.update(db.collection('breaking_points').doc(id), { order: idx + 1, updatedAt: now })
    })
    await batch.commit()
  }
}

export const newsRepo     = new NewsRepository()
export const newsCatRepo  = new NewsCategoryRepository()
export const bpRepo       = new BreakingPointRepository()
