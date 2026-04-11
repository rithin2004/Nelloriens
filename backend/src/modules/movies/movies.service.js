import { moviesRepo, theatresRepo } from './movies.repository.js'
import { CrudService }              from '../../utils/serviceBase.js'

export const moviesService = new CrudService(moviesRepo, {
  entityName: 'Movie',
  extraFilters: (query) => {
    const filters = []
    if (query.status) filters.push(['status', '==', query.status])
    return filters
  },
})

export const theatresService = new CrudService(theatresRepo, {
  entityName:  'Theatre',
  searchField: 'name',
})
