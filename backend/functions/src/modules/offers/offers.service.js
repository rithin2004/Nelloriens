import { offersRepo } from './offers.repository.js'
import { CrudService } from '../../utils/serviceBase.js'

export const offersService = new CrudService(offersRepo, {
  entityName:   'Offer',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ type }) => {
    const f = []
    if (type) f.push(['type', '==', type])
    return f
  },
})
