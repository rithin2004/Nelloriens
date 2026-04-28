import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const jobsRepo    = new FirestoreRepo('jobs',           { idPrefix: 'JOB' })
export const jobCatRepo  = new FirestoreRepo('job_categories', { idPrefix: 'JCT' })
export const jobLocRepo  = new FirestoreRepo('job_locations',  { idPrefix: 'JLC' })
export const jobTypeRepo = new FirestoreRepo('job_types',      { idPrefix: 'JTY' })
