import { realEstateRepo, realEstateLocRepo, realEstateTypeRepo, realEstateAmenityRepo } from './realestate.repository.js'
import { CrudService, CategoryService, badReq } from '../../utils/serviceBase.js'

export const realEstateService = new CrudService(realEstateRepo, {
  entityName:   'Real estate listing',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  validate: (data) => {
    if (!data.title?.trim()) badReq('title is required')
    if (data.sqft === undefined || data.sqft === null || data.sqft === '') badReq('sqft is required')
    if (data.section === 'rent') {
      if (data.monthlyRent === undefined || data.monthlyRent === null || data.monthlyRent === '') badReq('monthlyRent is required')
    } else {
      if (data.price === undefined || data.price === null || data.price === '') badReq('price is required')
    }
    if (!data.phone?.trim()) badReq('phone is required')
  },
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

export const realEstateLocService     = new CategoryService(realEstateLocRepo,     'Location')
export const realEstateTypeService    = new CategoryService(realEstateTypeRepo,    'Property type')
export const realEstateAmenityService = new CategoryService(realEstateAmenityRepo, 'Amenity')
