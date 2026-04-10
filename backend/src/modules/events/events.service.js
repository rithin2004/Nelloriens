import { eventsRepo, eventCatRepo } from './events.repository.js'
import { CrudService, CategoryService } from '../../utils/serviceBase.js'

export const eventsService = new CrudService(eventsRepo, {
  entityName:   'Event',
  searchField:  'title',
  orderBy:      'startDate',
  order:        'asc',
  extraFilters: ({ category }) => {
    const f = []
    if (category) f.push(['category', '==', category])
    return f
  },
})

export const eventCatService = new CategoryService(eventCatRepo, 'Event category')
