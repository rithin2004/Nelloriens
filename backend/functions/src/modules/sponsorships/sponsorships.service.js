import { sponsorshipsRepo } from './sponsorships.repository.js'
import { CrudService }      from '../../utils/serviceBase.js'
export const sponsorshipsService = new CrudService(sponsorshipsRepo, {
  entityName: 'Sponsorship',
  extraFilters: ({ placementPage, sponsorType }) => {
    const f = []
    if (placementPage && placementPage !== 'all') f.push(['placementPages', 'array-contains', placementPage])
    if (sponsorType    && sponsorType    !== 'All') f.push(['sponsorType',    '==',             sponsorType])
    return f
  }
})
