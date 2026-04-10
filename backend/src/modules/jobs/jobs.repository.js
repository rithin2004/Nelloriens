import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const jobsRepo     = new FirestoreRepo('jobs')
export const jobCatRepo   = new FirestoreRepo('job_categories')
export const jobLocRepo   = new FirestoreRepo('job_locations')
