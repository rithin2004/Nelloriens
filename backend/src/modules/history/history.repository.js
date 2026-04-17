import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const historyRepo = new FirestoreRepo('history', { idPrefix: 'HIS' })
