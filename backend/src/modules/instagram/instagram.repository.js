import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const instagramRepo = new FirestoreRepo('instagram_posts', { idPrefix: 'INS' })
