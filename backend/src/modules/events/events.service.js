import { eventsRepo, eventCatRepo, influencerEventsRepo } from './events.repository.js'
import { CrudService, CategoryService, notFound, badReq } from '../../utils/serviceBase.js'

class EventsService extends CrudService {
  async update(id, data) {
    const existing = await eventsRepo.findById(id)
    if (!existing) notFound('Event not found')

    // RULE 27 / RULE 13 — isPopular max 3 per category
    if (data.isPopular === true && !existing.isPopular) {
      const category = data.category || existing.category
      if (category) {
        const all          = await eventsRepo.findAll({})
        const popularInCat = all.filter(e => e.isPopular === true && e.category === category && e._id !== id)
        if (popularInCat.length >= 3) {
          if (!data.replaceId) {
            const err      = new Error('Maximum 3 Popular events per category reached. Choose one to replace.')
            err.status       = 409
            err.code         = 'MAX_LIMIT_REACHED'
            err.currentItems = popularInCat
            throw err
          }
          await eventsRepo.update(data.replaceId, { isPopular: false })
        }
      }
    }

    const { replaceId, ...cleanData } = data
    return eventsRepo.update(id, cleanData)
  }
}

export const eventsService = new EventsService(eventsRepo, {
  entityName:   'Event',
  searchField:  'title',
  orderBy:      'startDate',
  order:        'asc',
  extraFilters: ({ category }) => {
    const f = []
    if (category) f.push(['category', '==', category])
    return f
  },
})

export const eventCatService = new CategoryService(eventCatRepo, 'Event category')

// ── Influencer Events (RULE 27 — separate section, no categories, max 5 globally) ──

export const influencerEventsService = {
  async list(query = {}) {
    const { page = 1, limit = 20, search = '' } = query
    const lim = Math.min(parseInt(limit) || 20, 100)
    const pg  = Math.max(parseInt(page)  || 1,  1)
    let items = await influencerEventsRepo.findAll({ orderBy: 'createdAt', order: 'desc' })
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(e => e.title?.toLowerCase().includes(q))
    }
    const total = items.length
    return {
      items:      items.slice((pg - 1) * lim, pg * lim),
      total,
      page:       pg,
      totalPages: Math.max(1, Math.ceil(total / lim)),
    }
  },

  async getById(id) {
    const item = await influencerEventsRepo.findById(id)
    if (!item) notFound('Influencer event not found')
    return item
  },

  async create(data) {
    // RULE 27 / RULE 13 — max 5 globally
    const all = await influencerEventsRepo.findAll({})
    if (all.length >= 5) {
      const err      = new Error('Maximum 5 Influencer Events reached. Remove one before adding a new one.')
      err.status       = 409
      err.code         = 'MAX_LIMIT_REACHED'
      err.currentItems = all
      throw err
    }
    if (!data.title?.trim()) badReq('title is required')
    return influencerEventsRepo.create(data)
  },

  async update(id, data) {
    const existing = await influencerEventsRepo.findById(id)
    if (!existing) notFound('Influencer event not found')
    return influencerEventsRepo.update(id, data)
  },

  async remove(id) {
    const existing = await influencerEventsRepo.findById(id)
    if (!existing) notFound('Influencer event not found')
    await influencerEventsRepo.softDelete(id, { reason: 'manual' })
    return existing
  },

  async incrementViews(id, field) {
    await influencerEventsRepo.incrementField(id, field)
  },
}
