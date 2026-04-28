import { jobsRepo, jobCatRepo, jobLocRepo, jobTypeRepo } from './jobs.repository.js'
import { CrudService, CategoryService, badReq }        from '../../utils/serviceBase.js'

export const jobsService    = new CrudService(jobsRepo,   {
  entityName:   'Job',
  orderBy:      'publishedAt',
  order:        'desc',
  validate: (data) => {
    if (!data.title?.trim())            badReq('title is required')
    if (!data.companyName?.trim())      badReq('companyName is required')
    if (!data.lastDate?.trim())         badReq('lastDate is required')
    if (!data.shortDescription?.trim()) badReq('shortDescription is required')
  },
  extraFilters: ({ category, location, jobType, workMode }) => {
    const f = []
    if (category && category !== 'All') f.push(['category', '==', category])
    if (location  && location  !== 'All') f.push(['location',  '==', location])
    if (jobType   && jobType   !== 'All') f.push(['jobType',   '==', jobType])
    if (workMode  && workMode  !== 'All') f.push(['workMode',  '==', workMode])
    return f
  },
})
export const jobCatService  = new CategoryService(jobCatRepo,  'Job category')
export const jobLocService  = new CategoryService(jobLocRepo,  'Job location')
export const jobTypeService = new CategoryService(jobTypeRepo, 'Job type')
