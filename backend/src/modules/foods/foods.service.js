import { foodsRepo, photosRepo, varietiesRepo, sweetsRepo } from './foods.repository.js'
import { CrudService, badReq, notFound }                    from '../../utils/serviceBase.js'
import { db }                                               from '../../config/firebase.js'

export const foodsService = new CrudService(foodsRepo, { entityName: 'Food' })

// ── Photos (max 5, ordered) ────────────────────────────────────────────────
export const photosService = {
  async list() {
    return photosRepo.findAll({ orderBy: 'order', order: 'asc' })
  },

  async add(data) {
    const all = await photosRepo.findAll({})
    if (all.length >= 5) badReq('Maximum of 5 photos allowed')
    const maxOrder = all.reduce((m, p) => Math.max(m, p.order ?? 0), 0)
    return photosRepo.create({ ...data, order: maxOrder + 1 })
  },

  async remove(id) {
    const item = await photosRepo.findById(id)
    if (!item) notFound('Photo not found')
    await photosRepo.delete(id)
  },

  async reorder(items) {
    if (!Array.isArray(items) || items.length === 0) badReq('items array is required')
    const batch = db.batch()
    const col   = db.collection('foods_photos')
    items.forEach(({ id, order }) => {
      if (!id) return
      batch.update(col.doc(id), { order: Number(order), updatedAt: new Date().toISOString() })
    })
    await batch.commit()
  },
}

// ── Varieties ──────────────────────────────────────────────────────────────
export const varietiesService = {
  async list() {
    return varietiesRepo.findAll({ orderBy: 'name', order: 'asc' })
  },
  async create(data) {
    if (!data.name?.trim()) badReq('name is required')
    return varietiesRepo.create(data)
  },
  async update(id, data) {
    const item = await varietiesRepo.findById(id)
    if (!item) notFound('Variety not found')
    return varietiesRepo.update(id, data)
  },
  async remove(id) {
    const item = await varietiesRepo.findById(id)
    if (!item) notFound('Variety not found')
    await varietiesRepo.delete(id)
  },
}

// ── Sweets (max 8) ─────────────────────────────────────────────────────────
export const sweetsService = {
  async list() {
    return sweetsRepo.findAll({ orderBy: 'name', order: 'asc' })
  },
  async create(data) {
    const all = await sweetsRepo.findAll({})
    if (all.length >= 8) badReq('Maximum of 8 sweets allowed')
    if (!data.name?.trim()) badReq('name is required')
    return sweetsRepo.create(data)
  },
  async update(id, data) {
    const item = await sweetsRepo.findById(id)
    if (!item) notFound('Sweet not found')
    return sweetsRepo.update(id, data)
  },
  async remove(id) {
    const item = await sweetsRepo.findById(id)
    if (!item) notFound('Sweet not found')
    await sweetsRepo.delete(id)
  },
}
