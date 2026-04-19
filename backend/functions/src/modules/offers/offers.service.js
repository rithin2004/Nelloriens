import { offersRepo, offerCatRepo } from './offers.repository.js'
import { CrudService, CategoryService } from '../../utils/serviceBase.js'

export const offerCatService = new CategoryService(offerCatRepo, 'Offer category')

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
