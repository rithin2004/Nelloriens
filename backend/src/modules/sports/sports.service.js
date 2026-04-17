import { sportsRepo, sportCatRepo } from './sports.repository.js'
import { CrudService, CategoryService } from '../../utils/serviceBase.js'

export const sportsService = new CrudService(sportsRepo, {
  entityName:   'Sport',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ category, matchStatus, type }) => {
    const f = []
    if (type)     f.push(['type', '==', type])
    if (category) f.push(['category', '==', category])
    if (matchStatus) {
      const statuses = matchStatus.split(',').map(s => s.trim()).filter(Boolean)
      if (statuses.length > 1) f.push(['matchStatus', 'in', statuses])
      else if (statuses.length === 1) f.push(['matchStatus', '==', statuses[0]])
    }
    return f
  },
})

export const sportCatService = new CategoryService(sportCatRepo, 'Sport category')
