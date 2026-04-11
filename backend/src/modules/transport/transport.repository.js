import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const transportRepo           = new FirestoreRepo('transport',            { idPrefix: 'TRP' })
export const transportCategoriesRepo = new FirestoreRepo('transport_categories', { idPrefix: 'TCT' })
