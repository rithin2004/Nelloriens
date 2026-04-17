import { transportRepo } from './transport.repository.js'
import { CrudService }   from '../../utils/serviceBase.js'

// Transport categories are FIXED (RULE 31): train, bus, airport, local
export const TRANSPORT_TYPES = ['train', 'bus', 'airport', 'local']

export const transportService = new CrudService(transportRepo, {
  entityName:   'Transport',
  searchField:  'name',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ type }) => {
    const f = []
    if (type && TRANSPORT_TYPES.includes(type)) f.push(['type', '==', type])
    return f
  },
})
