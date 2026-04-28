import { foodsRepo, photosRepo, varietiesRepo, sweetsRepo, healthTipsRepo } from './foods.repository.js'
import { CrudService, badReq, notFound }                    from '../../utils/serviceBase.js'
import { db }                                               from '../../config/firebase.js'
import { getLimits }                                        from '../../utils/limits.js'

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
    const { _reservedId, ...rest } = data
    return photosRepo.create({ ...rest, order: nextOrder }, _reservedId || null)
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
  async incrementViews(id, field) {
    await varietiesRepo.incrementField(id, field)
  },
  async list(query = {}) {
    const { page = 1, limit = 20, search = '', category = '', popular } = query
    const lim = Math.min(parseInt(limit) || 20, 100)
    const pg  = Math.max(parseInt(page)  || 1,  1)
    let items = await varietiesRepo.findAll({ orderBy: 'name', order: 'asc' })
    if (popular === 'true')  items = items.filter(v => v.popular === true)
    if (popular === 'false') items = items.filter(v => !v.popular)
    if (category && category !== 'All') items = items.filter(v => v.category === category)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(v => v.name?.toLowerCase().includes(q))
    }
    const total = items.length
    return {
      items:      items.slice((pg - 1) * lim, pg * lim),
      total,
      page:       pg,
      totalPages: Math.max(1, Math.ceil(total / lim)),
    }
  },
  async create(data) {
    if (!data.name?.trim()) badReq('name is required')
    return varietiesRepo.create(data)
  },
  async update(id, data) {
    const item = await varietiesRepo.findById(id)
    if (!item) notFound('Variety not found')

    // RULE 33 / RULE 13 — popular max globally (configurable via Settings, field name: 'popular')
    if (data.popular === true && !item.popular) {
      const { maxPopularFoodVarieties } = await getLimits()
      const all     = await varietiesRepo.findAll({})
      const popular = all.filter(v => v.popular === true && v._id !== id)
      if (popular.length >= maxPopularFoodVarieties) {
        if (!data.replaceId) {
          const err      = new Error(`Maximum ${maxPopularFoodVarieties} Popular food varieties reached. Choose one to replace.`)
          err.status       = 409
          err.code         = 'MAX_LIMIT_REACHED'
          err.currentItems = popular
          throw err
        }
        await varietiesRepo.update(data.replaceId, { popular: false })
      }
    }

    const { replaceId: _replaceId, ...cleanData } = data
    return varietiesRepo.update(id, cleanData)
  },
  async remove(id, requestUser = null) {
    const item = await varietiesRepo.findById(id)
    if (!item) notFound('Variety not found')
    await varietiesRepo.softDelete(id, {
      deletedBy: requestUser?.uid || null,
      reason:    'manual',
    })
  },
}

// ── Health Tips ────────────────────────────────────────────────────────────
export const healthTipsService = {
  async incrementViews(id, field) {
    await healthTipsRepo.incrementField(id, field)
  },
  async list(query = {}) {
    const { page = 1, limit = 20, search = '' } = query
    const all = await healthTipsRepo.findAll({ orderBy: 'createdAt', order: 'desc' })
    const filtered = search
      ? all.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()))
      : all
    const total      = filtered.length
    const totalPages = Math.ceil(total / limit) || 1
    const items      = filtered.slice((page - 1) * limit, page * limit)
    return { items, total, page: Number(page), totalPages }
  },
  async create(data) {
    if (!data.title?.trim()) badReq('title is required')
    return healthTipsRepo.create(data)
  },
  async update(id, data) {
    const item = await healthTipsRepo.findById(id)
    if (!item) notFound('Health tip not found')
    return healthTipsRepo.update(id, data)
  },
  async remove(id, requestUser = null) {
    const item = await healthTipsRepo.findById(id)
    if (!item) notFound('Health tip not found')
    await healthTipsRepo.softDelete(id, {
      deletedBy: requestUser?.uid || null,
      reason:    'manual',
    })
  },
}

// ── Sweets (max 8) ─────────────────────────────────────────────────────────
export const sweetsService = {
  async incrementViews(id, field) {
    await sweetsRepo.incrementField(id, field)
  },
  async list(query = {}) {
    const { page = 1, limit = 20, search = '' } = query
    const lim = Math.min(parseInt(limit) || 20, 100)
    const pg  = Math.max(parseInt(page)  || 1,  1)
    let items = await sweetsRepo.findAll({ orderBy: 'name', order: 'asc' })
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(s => s.name?.toLowerCase().includes(q))
    }
    const total = items.length
    return {
      items:      items.slice((pg - 1) * lim, pg * lim),
      total,
      page:       pg,
      totalPages: Math.max(1, Math.ceil(total / lim)),
    }
  },
  async create(data) {
    const { maxSweetsGlobally } = await getLimits()
    const all = await sweetsRepo.findAll({})
    if (all.length >= maxSweetsGlobally) {
      const err = new Error(`Maximum ${maxSweetsGlobally} sweets allowed. Choose one to replace.`)
      err.status       = 409
      err.code         = 'MAX_LIMIT_REACHED'
      err.currentItems = all
      throw err
    }
    if (!data.name?.trim()) badReq('name is required')
    return sweetsRepo.create(data)
  },
  async update(id, data) {
    const item = await sweetsRepo.findById(id)
    if (!item) notFound('Sweet not found')
    return sweetsRepo.update(id, data)
  },
  async remove(id, requestUser = null) {
    const item = await sweetsRepo.findById(id)
    if (!item) notFound('Sweet not found')
    await sweetsRepo.softDelete(id, {
      deletedBy: requestUser?.uid || null,
      reason:    'manual',
    })
  },
}
