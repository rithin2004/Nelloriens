import { moviesRepo, theatresRepo, showtimesRepo, movieGenreRepo, movieLangRepo } from './movies.repository.js'
import { CrudService, CategoryService }                            from '../../utils/serviceBase.js'
import { getLimits }                                               from '../../utils/limits.js'

class MoviesService extends CrudService {
  async list(query = {}) {
    const { page = 1, limit = 20, search = '', status } = query
    const lim = Math.min(parseInt(limit) || 20, 100)
    const pg  = Math.max(parseInt(page)  || 1,  1)

    // Build Firestore-native filters
    const filters = []
    if (status && status !== 'All') filters.push(['status', '==', status])

    // ── Fast path: no text search → Firestore-level pagination ──
    if (!search) {
      return this.repo.paginate({
        page:    pg,
        limit:   lim,
        orderBy: 'createdAt',
        order:   'desc',
        filters,
      })
    }

    // ── Slow path: text search → narrow with Firestore filters, search in-memory ──
    let items = await this.repo.findAll({ orderBy: 'createdAt', order: 'desc', filters })
    const q = search.toLowerCase()
    items = items.filter((m) => m.movieName?.toLowerCase().includes(q) || m.title?.toLowerCase().includes(q))

    const total = items.length
    return {
      items:      items.slice((pg - 1) * lim, pg * lim),
      total,
      page:       pg,
      totalPages: Math.max(1, Math.ceil(total / lim)),
    }
  }

  async create(data) {
    // Required field validation for running movies
    if (!data.movieName?.trim()) throw Object.assign(new Error('movieName is required'), { status: 400 })
    if (data.status === 'running' || !data.status) {
      if (!data.language?.trim())   throw Object.assign(new Error('language is required'), { status: 400 })
      if (!data.genre?.trim())      throw Object.assign(new Error('genre is required'), { status: 400 })
      if (!data.synopsis?.trim())   throw Object.assign(new Error('synopsis is required'), { status: 400 })
      if (!data.runningFrom?.trim()) throw Object.assign(new Error('runningFrom is required'), { status: 400 })
    }
    // RULE 35 — max upcoming movies (configurable via Settings, default 10)
    if (data.status === 'coming_soon') {
      const { maxUpcomingMovies } = await getLimits()
      const all      = await this.repo.findAll({ orderBy: 'createdAt', order: 'desc' })
      const upcoming = all.filter(m => m.status === 'coming_soon')
      if (upcoming.length >= maxUpcomingMovies) {
        const err = new Error(`Maximum ${maxUpcomingMovies} Upcoming Movies reached. Remove one before adding a new one.`)
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

export const showtimesService = new CrudService(showtimesRepo, {
  entityName:   'Showtime',
  searchField:  'movieName',
  orderBy:      'startDate',
  order:        'asc',
  extraFilters: ({ theatreId, movieId }) => {
    const f = []
    if (theatreId) f.push(['theatreId', '==', theatreId])
    if (movieId)   f.push(['movieId',   '==', movieId])
    return f
  },
})

export const movieGenreService = new CategoryService(movieGenreRepo, 'Movie genre')
export const movieLangService  = new CategoryService(movieLangRepo,  'Movie language')

