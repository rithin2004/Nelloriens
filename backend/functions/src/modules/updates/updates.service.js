import { updatesRepo, updateCatRepo } from './updates.repository.js'
import { CrudService, CategoryService } from '../../utils/serviceBase.js'

export const updatesService = new CrudService(updatesRepo, {
  entityName:   'Update',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ category }) => {
    const f = []
    if (category) f.push(['category', '==', category])
    return f
  },
})

export const updateCatService = new CategoryService(updateCatRepo, 'Update category')
