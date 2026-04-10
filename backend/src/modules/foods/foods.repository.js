import { FirestoreRepo } from '../../utils/firestoreRepo.js'
export const foodsRepo     = new FirestoreRepo('foods')
export const photosRepo    = new FirestoreRepo('foods_photos')
export const varietiesRepo = new FirestoreRepo('foods_varieties')
export const sweetsRepo    = new FirestoreRepo('foods_sweets')
