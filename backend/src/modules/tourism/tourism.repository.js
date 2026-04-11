import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const tourismRepo    = new FirestoreRepo('tourism',            { idPrefix: 'TRM' })
export const tourismCatRepo = new FirestoreRepo('tourism_categories', { idPrefix: 'TMC' })
