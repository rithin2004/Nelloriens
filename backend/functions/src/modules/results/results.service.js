import { resultsRepo, resultCatRepo } from './results.repository.js'
import { CrudService, CategoryService, badReq } from '../../utils/serviceBase.js'

export const resultsService = new CrudService(resultsRepo, {
  entityName:   'Result',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  validate: (data) => {
    if (!data.title?.trim())          badReq('title is required')
    if (!data.conductingBody?.trim()) badReq('conductingBody is required')
    if (!data.year)                   badReq('year is required')
  },
  extraFilters: ({ category, status }) => {
    const f = []
    if (category) f.push(['category', '==', category])
    if (status)   f.push(['status',   '==', status])
    return f
  },
})

export const resultCatService = new CategoryService(resultCatRepo, 'Result category')
