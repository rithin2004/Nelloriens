import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const sponsorshipsRepo = new FirestoreRepo('sponsorships', { idPrefix: 'SPN' })
