import { adsRepo } from './ads.repository.js'
import { CrudService } from '../../utils/serviceBase.js'

export const adsService = new CrudService(adsRepo, {
  entityName:   'Ad',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ position, active }) => {
    const f = []
    if (position)                  f.push(['position', '==', position])
    if (active === 'true')         f.push(['active', '==', true])
    if (active === 'false')        f.push(['active', '==', false])
    return f
  },
})
