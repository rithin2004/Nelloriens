import { jobsRepo, jobCatRepo, jobLocRepo } from './jobs.repository.js'
import { CrudService, CategoryService }    from '../../utils/serviceBase.js'

export const jobsService    = new CrudService(jobsRepo,   {
  entityName:   'Job',
  orderBy:      'publishedAt',
  order:        'desc',
  extraFilters: ({ category, location }) => {
    const f = []
    if (category && category !== 'All') f.push(['category', '==', category])
    if (location  && location  !== 'All') f.push(['location',  '==', location])
    return f
  },
})
export const jobCatService  = new CategoryService(jobCatRepo, 'Job category')
export const jobLocService  = new CategoryService(jobLocRepo, 'Job location')
