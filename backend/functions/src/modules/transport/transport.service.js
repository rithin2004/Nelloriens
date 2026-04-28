import { transportRepo } from './transport.repository.js'
import { CrudService, badReq }   from '../../utils/serviceBase.js'

// Transport categories are FIXED (RULE 31): train, bus, airport, local
export const TRANSPORT_TYPES = ['train', 'bus', 'airport', 'local']

export const transportService = new CrudService(transportRepo, {
  entityName:   'Transport',
  searchField:  'name',
  orderBy:      'createdAt',
  order:        'desc',
  validate: (data) => {
    if (!data.name?.trim()) badReq('name is required')
    if (!data.type || !TRANSPORT_TYPES.includes(data.type)) badReq('type must be train, bus, airport, or local')
    if (data.type === 'train') {
      if (!data.trainNumber?.trim())    badReq('trainNumber is required')
      if (!data.fromStation?.trim())    badReq('fromStation is required')
      if (!data.toStation?.trim())      badReq('toStation is required')
      if (!data.departureTime?.trim())  badReq('departureTime is required')
      if (!data.arrivalTime?.trim())    badReq('arrivalTime is required')
      if (!data.daysOfOperation?.length) badReq('daysOfOperation is required')
    }
    if (data.type === 'bus') {
      if (!data.routeNumber?.trim())    badReq('routeNumber is required')
      if (!data.fromStop?.trim())       badReq('fromStop is required')
      if (!data.toStop?.trim())         badReq('toStop is required')
      if (!data.departureTime?.trim())  badReq('departureTime is required')
      if (!data.arrivalTime?.trim())    badReq('arrivalTime is required')
    }
  },
  extraFilters: ({ type }) => {
    const f = []
    if (type && TRANSPORT_TYPES.includes(type)) f.push(['type', '==', type])
    return f
  },
})
