import { moviesRepo, theatresRepo, trailersRepo } from './movies.repository.js'
import { CrudService }              from '../../utils/serviceBase.js'

class MoviesService extends CrudService {
  async list(query = {}) {
    const { page = 1, limit = 20, search = '', status } = query
    const lim = Math.min(parseInt(limit) || 20, 100)
    const pg  = Math.max(parseInt(page)  || 1,  1)

    // Fetch all ordered, then filter in-memory to avoid composite index requirement
    let items = await this.repo.findAll({ orderBy: 'createdAt', order: 'desc' })

    if (search) {
      const q = search.toLowerCase()
      items = items.filter((m) => m.movieName?.toLowerCase().includes(q) || m.title?.toLowerCase().includes(q))
    }
    if (status) {
      items = items.filter((m) => m.status === status)
    }

    const total = items.length
    return {
      items:      items.slice((pg - 1) * lim, pg * lim),
      total,
      page:       pg,
      totalPages: Math.max(1, Math.ceil(total / lim)),
    }
  }

  async create(data) {
    // RULE 35 — max 8 upcoming movies
    if (data.status === 'coming_soon') {
      const all      = await this.repo.findAll({ orderBy: 'createdAt', order: 'desc' })
      const upcoming = all.filter(m => m.status === 'coming_soon')
      if (upcoming.length >= 8) {
        const err = new Error('Maximum 8 Upcoming Movies reached. Remove one before adding a new one.')
        err.status       = 409
        err.code         = 'MAX_LIMIT_REACHED'
        err.currentItems = upcoming
        throw err
      }
    }
    return super.create(data)
  }
}

export const moviesService = new MoviesService(moviesRepo, { entityName: 'Movie' })

export const theatresService = new CrudService(theatresRepo, {
  entityName:  'Theatre',
  searchField: 'name',
})

export const trailersService = new CrudService(trailersRepo, {
  entityName:   'Trailer',
  searchField:  'movieName',
  orderBy:      'createdAt',
  order:        'desc',
})
