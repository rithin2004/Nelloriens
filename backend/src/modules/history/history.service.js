import { historyRepo }               from './history.repository.js'
import { CrudService, badReq } from '../../utils/serviceBase.js'
import { db }                        from '../../config/firebase.js'

export const historyService = new CrudService(historyRepo, { entityName: 'History', orderBy: 'order', order: 'asc' })

export async function reorderHistory(items) {
  if (!Array.isArray(items) || items.length === 0) badReq('items array is required')
  const batch = db.batch()
  const col   = db.collection('history')
  items.forEach(({ id, order }) => {
    if (!id) return
    batch.update(col.doc(id), { order: Number(order), updatedAt: new Date().toISOString() })
  })
  await batch.commit()
}
