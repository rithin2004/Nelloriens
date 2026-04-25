import { resultsRepo, resultCatRepo } from './results.repository.js'
import { CrudService, CategoryService } from '../../utils/serviceBase.js'

export const resultsService = new CrudService(resultsRepo, {
  entityName:   'Result',
  searchField:  'title',
  orderBy:      'publishedAt',
  order:        'desc',
  extraFilters: ({ category, status }) => {
    const f = []
    if (category) f.push(['category', '==', category])
    if (status)   f.push(['status',   '==', status])
    return f
  },
})

export const resultCatService = new CategoryService(resultCatRepo, 'Result category')
