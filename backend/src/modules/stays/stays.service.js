import { staysRepo } from './stays.repository.js'
import { CrudService } from '../../utils/serviceBase.js'

export const staysService = new CrudService(staysRepo, {
  entityName:   'Stay',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ city, type }) => {
    const f = []
    if (city) f.push(['city', '==', city])
    if (type) f.push(['type', '==', type])
    return f
  },
})
