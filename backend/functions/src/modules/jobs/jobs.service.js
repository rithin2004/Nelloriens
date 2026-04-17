import { jobsRepo, jobCatRepo, jobLocRepo } from './jobs.repository.js'
import { CrudService, CategoryService }    from '../../utils/serviceBase.js'

export const jobsService    = new CrudService(jobsRepo,   { entityName: 'Job',      orderBy: 'publishedAt', order: 'desc' })
export const jobCatService  = new CategoryService(jobCatRepo, 'Job category')
export const jobLocService  = new CategoryService(jobLocRepo, 'Job location')
