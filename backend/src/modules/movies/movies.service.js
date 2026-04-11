import { moviesRepo, theatresRepo } from './movies.repository.js'
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
}

export const moviesService = new MoviesService(moviesRepo, { entityName: 'Movie' })

export const theatresService = new CrudService(theatresRepo, {
  entityName:  'Theatre',
  searchField: 'name',
})
