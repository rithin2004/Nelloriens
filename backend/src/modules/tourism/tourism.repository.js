import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const tourismRepo       = new FirestoreRepo('tourism',               { idPrefix: 'TUR' })
export const tourismCatRepo    = new FirestoreRepo('tourism_categories',    { idPrefix: 'TMC' })
export const tourismLocRepo    = new FirestoreRepo('tourism_locations',     { idPrefix: 'TLC' })
export const tourismPhotosRepo = new FirestoreRepo('tourism_display_photos')
