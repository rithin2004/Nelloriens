import { foodsRepo, photosRepo, varietiesRepo, sweetsRepo } from './foods.repository.js'
import { CrudService, badReq, notFound }                    from '../../utils/serviceBase.js'
import { db }                                               from '../../config/firebase.js'

export const foodsService = new CrudService(foodsRepo, { entityName: 'Food' })

const PHOTOS_MAX = 5

// ── Photos (max 5, ordered) ────────────────────────────────────────────────
export const photosService = {
  async list() {
    return photosRepo.findAll({ orderBy: 'order', order: 'asc' })
  },

  async add(data) {
    const all = await photosRepo.findAll({ orderBy: 'order', order: 'asc' })
    if (all.length >= PHOTOS_MAX) badReq(`Maximum of ${PHOTOS_MAX} photos allowed`)
    // Append after the last item's order value — safe even if gaps exist
    const nextOrder = all.length === 0 ? 1 : all[all.length - 1].order + 1
    return photosRepo.create({ ...data, order: nextOrder })
  },

  async remove(id) {
    const item = await photosRepo.findById(id)
    if (!item) notFound('Photo not found')
    await photosRepo.delete(id)
    // Resequence remaining so orders are 1…n with no gaps
    const remaining = await photosRepo.findAll({ orderBy: 'order', order: 'asc' })
    if (remaining.length > 0) {
      const batch = db.batch()
      const now   = new Date().toISOString()
      remaining.forEach((p, idx) => {
        batch.update(db.collection('foods_photos').doc(p._id), { order: idx + 1, updatedAt: now })
      })
      await batch.commit()
    }
  },

  async reorder(ids) {
    if (!Array.isArray(ids) || ids.length === 0) badReq('ids array is required')
    const all = await photosRepo.findAll({ orderBy: 'order', order: 'asc' })
    if (ids.length !== all.length) badReq(`Expected ${all.length} ids, got ${ids.length}`)
    const batch = db.batch()
    const now   = new Date().toISOString()
    ids.forEach((id, idx) => {
      batch.update(db.collection('foods_photos').doc(id), { order: idx + 1, updatedAt: now })
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
