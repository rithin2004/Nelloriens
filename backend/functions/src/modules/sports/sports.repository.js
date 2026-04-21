import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const sportsRepo          = new FirestoreRepo('sports',             { idPrefix: 'SPT' })
export const sportCatRepo        = new FirestoreRepo('sport_categories',   { idPrefix: 'SCT' })
export const sportLiveScoresRepo = new FirestoreRepo('sport_live_scores',  { idPrefix: 'SLS' })
