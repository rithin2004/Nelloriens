import { historyRepo }               from './history.repository.js'
import { CrudService, badReq, notFound } from '../../utils/serviceBase.js'
import { db }                        from '../../config/firebase.js'

const _base = new CrudService(historyRepo, {
  entityName:   'History',
  orderBy:      'order',
  order:        'asc',
  extraFilters: ({ category }) => {
    const f = []
    if (category && category !== 'All') f.push(['category', '==', category])
    return f
  },
})

export const historyService = {
  list:           (...args) => _base.list(...args),
  getById:        (...args) => _base.getById(...args),
  update:         (...args) => _base.update(...args),
  incrementViews: (id, field) => historyRepo.incrementField(id, field),

  async create(data) {
    // Append after the last item's order — safe even if gaps exist in data
    const all       = await historyRepo.findAll({ orderBy: 'order', order: 'asc' })
    const nextOrder = all.length === 0 ? 1 : all[all.length - 1].order + 1
    return historyRepo.create({ ...data, order: nextOrder })
  },

  async remove(id, requestUser = null) {
    const existing = await historyRepo.findById(id)
    if (!existing) notFound('History item not found')
    await historyRepo.softDelete(id, {
      deletedBy: requestUser?.uid || null,
      reason:    'manual',
    })
    // Resequence remaining items so orders are 1…n with no gaps
    const remaining = await historyRepo.findAll({ orderBy: 'order', order: 'asc' })
    if (remaining.length > 0) {
      const batch = db.batch()
      const now   = new Date().toISOString()
      remaining.forEach((item, idx) => {
        batch.update(db.collection('history').doc(item._id), { order: idx + 1, updatedAt: now })
      })
      await batch.commit()
    }
    return existing
  },
}

export async function reorderHistory(ids) {
  if (!Array.isArray(ids) || ids.length === 0) badReq('ids array is required')
  const all = await historyRepo.findAll({ orderBy: 'order', order: 'asc' })
  if (ids.length !== all.length) badReq(`Expected ${all.length} ids, got ${ids.length}`)
  const batch = db.batch()
  const now   = new Date().toISOString()
  ids.forEach((id, idx) => {
    batch.update(db.collection('history').doc(id), { order: idx + 1, updatedAt: now })
  })
  await batch.commit()
}
