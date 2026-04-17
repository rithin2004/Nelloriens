import { realEstateRepo, realEstateLocRepo, realEstateTypeRepo } from './realestate.repository.js'
import { CrudService, CategoryService } from '../../utils/serviceBase.js'

export const realEstateService = new CrudService(realEstateRepo, {
  entityName:   'Real estate listing',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  extraFilters: ({ section, type, location, bhk, minSqft, maxSqft, minPrice, maxPrice }) => {
    const f = []
    if (section)  f.push(['section',  '==', section])
    if (type)     f.push(['type',     '==', type])
    if (location) f.push(['location', '==', location])
    if (bhk)      f.push(['bhk',      '==', parseInt(bhk)])
    if (minSqft)  f.push(['sqft',     '>=', parseFloat(minSqft)])
    if (maxSqft)  f.push(['sqft',     '<=', parseFloat(maxSqft)])
    if (minPrice) f.push(['price',    '>=', minPrice])
    if (maxPrice) f.push(['price',    '<=', maxPrice])
    return f
  },
})

export const realEstateLocService  = new CategoryService(realEstateLocRepo,  'Location')
export const realEstateTypeService = new CategoryService(realEstateTypeRepo, 'Property type')
