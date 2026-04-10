import { tourismRepo, tourismCatRepo } from './tourism.repository.js'
import { CrudService, CategoryService } from '../../utils/serviceBase.js'

export const tourismService = new CrudService(tourismRepo, {
  entityName:   'Tourism place',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ category }) => {
    const f = []
    if (category) f.push(['category', '==', category])
    return f
  },
})

export const tourismCatService = new CategoryService(tourismCatRepo, 'Tourism category')
