import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const foodsRepo     = new FirestoreRepo('foods',           { idPrefix: 'FOD' })
export const photosRepo    = new FirestoreRepo('foods_photos',    { idPrefix: 'FPH' })
export const varietiesRepo = new FirestoreRepo('foods_varieties', { idPrefix: 'FVR' })
export const sweetsRepo    = new FirestoreRepo('foods_sweets',    { idPrefix: 'FSW' })
