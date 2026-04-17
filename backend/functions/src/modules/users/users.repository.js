import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const usersRepo = new FirestoreRepo('users', { idPrefix: 'USR' })
