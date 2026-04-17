import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const leadsRepo = new FirestoreRepo('leads', { idPrefix: 'LED' })
