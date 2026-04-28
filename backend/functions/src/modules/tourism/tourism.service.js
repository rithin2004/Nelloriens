import { tourismRepo, tourismCatRepo, tourismLocRepo, tourismPhotosRepo } from './tourism.repository.js'
import { CrudService, CategoryService, notFound } from '../../utils/serviceBase.js'
import { getLimits } from '../../utils/limits.js'

// ── Tourist Places — with Popular toggle max 10 globally (RULE 13) ───────────

class TourismService extends CrudService {
  async update(id, data) {
    const existing = await tourismRepo.findById(id)
    if (!existing) notFound('Tourism place not found')

    // RULE 13 — isPopular max globally (configurable via Settings), backend enforced
    if (data.isPopular === true && !existing.isPopular) {
      const { maxPopularTourism } = await getLimits()
      const all          = await tourismRepo.findAll({})
      const popularItems = all.filter(t => t.isPopular === true && t._id !== id)
      if (popularItems.length >= maxPopularTourism) {
        if (!data.replaceId) {
          const err        = new Error(`Maximum ${maxPopularTourism} Popular destinations reached. Choose one to replace.`)
          err.status       = 409
          err.code         = 'MAX_LIMIT_REACHED'
          err.currentItems = popularItems
          throw err
        }
        await tourismRepo.update(data.replaceId, { isPopular: false })
      }
    }

    const { replaceId: _replaceId, ...cleanData } = data
    return tourismRepo.update(id, cleanData)
  }
}

export const tourismService = new TourismService(tourismRepo, {
  entityName:   'Tourism place',
  searchField:  'placeName',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ category, location }) => {
    const f = []
    if (category) f.push(['category', '==', category])
    if (location) f.push(['location', '==', location])
    return f
  },
})

export const tourismCatService = new CategoryService(tourismCatRepo, 'Tourism category')
export const tourismLocService = new CategoryService(tourismLocRepo, 'Tourism location')

// ── Display Photos (Section 1 — exactly 3, drag-to-reorder) ─────────────────

export const tourismPhotosService = {
  async list() {
    const all = await tourismPhotosRepo.findAll({ orderBy: 'order', order: 'asc' })
    return all.slice(0, 3)
  },

  async create(data) {
    const all = await tourismPhotosRepo.findAll({})
    if (all.length >= 3) {
      const err    = new Error('Maximum 3 display photos allowed. Delete one first.')
      err.status   = 409
      throw err
    }
    return tourismPhotosRepo.create({ ...data, order: all.length })
  },

  async update(id, data) {
    const existing = await tourismPhotosRepo.findById(id)
    if (!existing) notFound('Display photo not found')
    return tourismPhotosRepo.update(id, data)
  },

  async remove(id) {
    const existing = await tourismPhotosRepo.findById(id)
    if (!existing) notFound('Display photo not found')
    await tourismPhotosRepo.delete(id)
    // Re-normalise orders
    const remaining = await tourismPhotosRepo.findAll({ orderBy: 'order', order: 'asc' })
    for (let i = 0; i < remaining.length; i++) {
      await tourismPhotosRepo.update(remaining[i]._id, { order: i })
    }
  },

  async reorder(ids) {
    for (let i = 0; i < ids.length; i++) {
      await tourismPhotosRepo.update(ids[i], { order: i })
    }
  },
}
