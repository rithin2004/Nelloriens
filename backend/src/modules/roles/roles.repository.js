import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const rolesRepo = new FirestoreRepo('roles', { idPrefix: 'ROL' })
