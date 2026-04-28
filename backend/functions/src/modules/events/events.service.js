import { eventsRepo, eventCatRepo, eventLocationRepo, influencerEventsRepo } from './events.repository.js'
import { CrudService, CategoryService, notFound, badReq } from '../../utils/serviceBase.js'
import { getLimits } from '../../utils/limits.js'

class EventsService extends CrudService {
  async update(id, data) {
    const existing = await eventsRepo.findById(id)
    if (!existing) notFound('Event not found')

    // RULE 27 / RULE 13 — isPopular max per category (configurable via Settings)
    if (data.isPopular === true && !existing.isPopular) {
      const category = data.category || existing.category
      if (category) {
        const { maxPopularEventsPerCategory } = await getLimits()
        const all          = await eventsRepo.findAll({})
        const popularInCat = all.filter(e => e.isPopular === true && e.category === category && e._id !== id)
        if (popularInCat.length >= maxPopularEventsPerCategory) {
          if (!data.replaceId) {
            const err      = new Error(`Maximum ${maxPopularEventsPerCategory} Popular events per category reached. Choose one to replace.`)
            err.status       = 409
            err.code         = 'MAX_LIMIT_REACHED'
            err.currentItems = popularInCat
            throw err
          }
          await eventsRepo.update(data.replaceId, { isPopular: false })
        }
      }
    }

    const { replaceId: _replaceId, ...cleanData } = data
    return eventsRepo.update(id, cleanData)
  }
}

export const eventsService = new EventsService(eventsRepo, {
  entityName:   'Event',
  searchField:  'title',
  orderBy:      'startDate',
  order:        'asc',
  validate: (data) => {
    if (!data.title?.trim())     badReq('title is required')
    if (!data.venueName?.trim()) badReq('venueName is required')
    if (!data.description?.trim()) badReq('description is required')
  },
  extraFilters: ({ category, location }) => {
    const f = []
    if (category) f.push(['category', '==', category])
    if (location) f.push(['location', '==', location])
    return f
  },
})

export const eventCatService = new CategoryService(eventCatRepo, 'Event category')
export const eventLocService = new CategoryService(eventLocationRepo, 'Event location')

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
    // RULE 27 / RULE 13 — max influencer events globally (configurable via Settings)
    const { maxInfluencerEvents } = await getLimits()
    const all = await influencerEventsRepo.findAll({})
    if (all.length >= maxInfluencerEvents) {
      const err      = new Error(`Maximum ${maxInfluencerEvents} Influencer Events reached. Remove one before adding a new one.`)
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
