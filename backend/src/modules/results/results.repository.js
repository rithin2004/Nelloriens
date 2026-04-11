import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const resultsRepo   = new FirestoreRepo('results',           { idPrefix: 'RST' })
export const resultCatRepo = new FirestoreRepo('result_categories', { idPrefix: 'RCT' })
