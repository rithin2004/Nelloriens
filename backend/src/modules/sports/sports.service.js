import { sportsRepo, sportCatRepo } from './sports.repository.js'
import { CrudService, CategoryService } from '../../utils/serviceBase.js'

export const sportsService = new CrudService(sportsRepo, {
  entityName:   'Sport',
  searchField:  'title',
  orderBy:      'matchDateTime',
  order:        'desc',
  extraFilters: ({ category }) => {
    const f = []
    if (category) f.push(['category', '==', category])
    return f
  },
})

export const sportCatService = new CategoryService(sportCatRepo, 'Sport category')
