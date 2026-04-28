import { staysRepo, stayCatRepo, stayLocationRepo } from './stays.repository.js'
import { CrudService, CategoryService, notFound, badReq } from '../../utils/serviceBase.js'
import { getLimits } from '../../utils/limits.js'

class StaysService extends CrudService {
  async update(id, data) {
    const existing = await staysRepo.findById(id)
    if (!existing) notFound('Stay not found')

    // RULE 30 / RULE 13 — isTop max per category (configurable via Settings)
    if (data.isTop === true && !existing.isTop) {
      const category = data.category || existing.category
      if (category) {
        const { maxTopStayPerCategory } = await getLimits()
        const all       = await staysRepo.findAll({})
        const topInCat  = all.filter(s => s.isTop === true && s.category === category && s._id !== id)
        if (topInCat.length >= maxTopStayPerCategory) {
          if (!data.replaceId) {
            const err      = new Error(`Maximum ${maxTopStayPerCategory} Top stays per category reached. Choose one to replace.`)
            err.status       = 409
            err.code         = 'MAX_LIMIT_REACHED'
            err.currentItems = topInCat
            throw err
          }
          await staysRepo.update(data.replaceId, { isTop: false })
        }
      }
    }

    const { replaceId: _replaceId, ...cleanData } = data
    return staysRepo.update(id, cleanData)
  }
}

export const staysService = new StaysService(staysRepo, {
  entityName:   'Stay',
  searchField:  'title',
  orderBy:      'createdAt',
  order:        'desc',
  validate: (data) => {
    if (!data.title?.trim())           badReq('title is required')
    if (!data.pricePerNight && data.pricePerNight !== 0) badReq('pricePerNight is required')
    if (!data.phone?.trim())           badReq('phone is required')
    if (!data.address?.trim())         badReq('address is required')
    if (!data.description?.trim())     badReq('description is required')
  },
  extraFilters: ({ city, type, category, location }) => {
    const f = []
    if (city)     f.push(['city',     '==', city])
    if (type)     f.push(['type',     '==', type])
    if (category) f.push(['category', '==', category])
    if (location) f.push(['location', '==', location])
    return f
  },
})

export const stayCatService = new CategoryService(stayCatRepo,      'Stay category')
export const stayLocService = new CategoryService(stayLocationRepo,  'Stay location')
