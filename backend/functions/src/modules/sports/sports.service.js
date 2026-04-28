import { sportsRepo, sportCatRepo } from './sports.repository.js'
import { CrudService, CategoryService } from '../../utils/serviceBase.js'
import { getLimits } from '../../utils/limits.js'

function computeStatus(item) {
  if (!item.eventDate) return 'upcoming'
  const eventTime  = new Date(item.eventDate).getTime()
  const now        = Date.now()
  const durationMs = (parseInt(item.duration) || 120) * 60 * 1000
  if (now < eventTime)              return 'upcoming'
  if (now < eventTime + durationMs) return 'live'
  return 'completed'
}

class SportsEventService extends CrudService {
  async list(query = {}) {
    const result = await super.list(query)
    result.items = result.items.map(item => ({ ...item, status: computeStatus(item) }))
    return result
  }

  async getById(id) {
    const item = await super.getById(id)
    return { ...item, status: computeStatus(item) }
  }

  async create(data) {
    const { maxUpcomingSports } = await getLimits()
    const all    = await this.repo.findAll({ orderBy: 'createdAt', order: 'desc' })
    const events = all.filter(m => m.type === 'event')
    if (events.length >= maxUpcomingSports) {
      const err        = new Error(`Maximum ${maxUpcomingSports} Sport Events reached. Remove one before adding a new one.`)
      err.status       = 409
      err.code         = 'MAX_LIMIT_REACHED'
      err.currentItems = events
      throw err
    }
    return super.create(data)
  }
}

export const sportsService = new CrudService(sportsRepo, {
  entityName:   'Sport',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ category, type }) => {
    const f = []
    if (type)     f.push(['type', '==', type])
    if (category) f.push(['category', '==', category])
    return f
  },
})

export const sportsEventService = new SportsEventService(sportsRepo, {
  entityName:   'Sport Event',
  searchField:  'title',
  orderBy:      'eventDate',
  order:        'asc',
  extraFilters: ({ category }) => {
    const f = [['type', '==', 'event']]
    if (category) f.push(['category', '==', category])
    return f
  },
})

export const sportCatService = new CategoryService(sportCatRepo, 'Sport category')
