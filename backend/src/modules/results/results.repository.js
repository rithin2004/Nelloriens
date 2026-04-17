import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const resultsRepo   = new FirestoreRepo('results',           { idPrefix: 'RSL' })
export const resultCatRepo = new FirestoreRepo('result_categories', { idPrefix: 'RCT' })
