import { sportsRepo, sportCatRepo, sportLiveScoresRepo } from './sports.repository.js'
import { CrudService, CategoryService } from '../../utils/serviceBase.js'

class UpcomingSportsService extends CrudService {
  async list(query = {}) {
    const now = new Date().toISOString()
    const result = await super.list(query)
    // filter out expired events server-side
    result.items = result.items.filter(item => !item.validUpto || item.validUpto >= now)
    result.total = result.items.length
    return result
  }

  async create(data) {
    const all      = await this.repo.findAll({ orderBy: 'createdAt', order: 'desc' })
    const upcoming = all.filter(m => m.type === 'upcoming')
    if (upcoming.length >= 12) {
      const err     = new Error('Maximum 12 Upcoming Events reached. Remove one before adding a new one.')
      err.status       = 409
      err.code         = 'MAX_LIMIT_REACHED'
      err.currentItems = upcoming
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

export const upcomingSportsService = new UpcomingSportsService(sportsRepo, {
  entityName:   'Upcoming Sport',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ category }) => {
    const f = [['type', '==', 'upcoming']]
    if (category) f.push(['category', '==', category])
    return f
  },
})

export const sportCatService = new CategoryService(sportCatRepo, 'Sport category')

export const sportLiveScoresService = new CrudService(sportLiveScoresRepo, {
  entityName:  'Sport Live Score',
  searchField: 'sportName',
  orderBy:     'createdAt',
  order:       'desc',
})
