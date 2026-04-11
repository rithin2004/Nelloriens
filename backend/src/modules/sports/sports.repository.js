import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const sportsRepo   = new FirestoreRepo('sports',           { idPrefix: 'SPT' })
export const sportCatRepo = new FirestoreRepo('sport_categories', { idPrefix: 'SCT' })
