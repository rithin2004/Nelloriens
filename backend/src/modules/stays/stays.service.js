import { staysRepo } from './stays.repository.js'
import { CrudService, notFound } from '../../utils/serviceBase.js'

class StaysService extends CrudService {
  async update(id, data) {
    const existing = await staysRepo.findById(id)
    if (!existing) notFound('Stay not found')

    // RULE 30 / RULE 13 — isTop max 3 per category
    if (data.isTop === true && !existing.isTop) {
      const category = data.category || existing.category
      if (category) {
        const all       = await staysRepo.findAll({})
        const topInCat  = all.filter(s => s.isTop === true && s.category === category && s._id !== id)
        if (topInCat.length >= 3) {
          if (!data.replaceId) {
            const err      = new Error('Maximum 3 Top stays per category reached. Choose one to replace.')
            err.status       = 409
            err.code         = 'MAX_LIMIT_REACHED'
            err.currentItems = topInCat
            throw err
          }
          await staysRepo.update(data.replaceId, { isTop: false })
        }
      }
    }

    const { replaceId, ...cleanData } = data
    return staysRepo.update(id, cleanData)
  }
}

export const staysService = new StaysService(staysRepo, {
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
