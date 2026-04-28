import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const staysRepo        = new FirestoreRepo('stays',            { idPrefix: 'STY' })
export const stayCatRepo      = new FirestoreRepo('stay_categories',  { idPrefix: 'SCT' })
export const stayLocationRepo = new FirestoreRepo('stay_locations',   { idPrefix: 'SLC' })
