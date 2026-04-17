import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const realEstateRepo      = new FirestoreRepo('realestate',             { idPrefix: 'RES' })
export const realEstateLocRepo   = new FirestoreRepo('realestate_locations',   { idPrefix: 'REL' })
export const realEstateTypeRepo  = new FirestoreRepo('realestate_types',       { idPrefix: 'RET' })
