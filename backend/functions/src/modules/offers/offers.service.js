import { offersRepo, offerCatRepo, offerTypeRepo, offerLocationRepo } from './offers.repository.js'
import { CrudService, CategoryService, badReq } from '../../utils/serviceBase.js'

export const offerCatService  = new CategoryService(offerCatRepo,      'Offer category')
export const offerTypeService = new CategoryService(offerTypeRepo,     'Offer type')
export const offerLocService  = new CategoryService(offerLocationRepo, 'Offer location')

export const offersService = new CrudService(offersRepo, {
  entityName:   'Offer',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  validate: (data) => {
    if (!data.title?.trim())        badReq('title is required')
    if (!data.businessName?.trim()) badReq('businessName is required')
    if (!data.validUntil?.trim())   badReq('validUntil is required')
    if (!data.description?.trim())  badReq('description is required')
  },
  extraFilters: ({ category, type, location }) => {
    const f = []
    if (category && category !== 'All') f.push(['category', '==', category])
    if (type && type !== 'All')         f.push(['type',     '==', type])
    if (location && location !== 'All') f.push(['location', '==', location])
    return f
  },
})
