import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const updatesRepo   = new FirestoreRepo('updates',           { idPrefix: 'UPD' })
export const updateCatRepo = new FirestoreRepo('update_categories', { idPrefix: 'UCT' })
