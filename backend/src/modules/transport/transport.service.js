import { transportRepo, transportCategoriesRepo } from './transport.repository.js'
import { CrudService, CategoryService }           from '../../utils/serviceBase.js'

export const transportService = new CrudService(transportRepo, {
  entityName:   'Transport',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ category }) => {
    const f = []
    if (category) f.push(['category', '==', category])
    return f
  },
})

export const transportCategoriesService = new CategoryService(transportCategoriesRepo, 'Transport category')
