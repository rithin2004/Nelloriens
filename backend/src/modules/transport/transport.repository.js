import { FirestoreRepo } from '../../utils/firestoreRepo.js'

// Transport categories are FIXED (RULE 31): train, bus, airport, local — no dynamic management
export const transportRepo = new FirestoreRepo('transport', { idPrefix: 'TRN' })
