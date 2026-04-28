import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const offersRepo        = new FirestoreRepo('offers',            { idPrefix: 'OFR' })
export const offerCatRepo      = new FirestoreRepo('offer_categories',  { idPrefix: 'OCT' })
export const offerTypeRepo     = new FirestoreRepo('offer_types',       { idPrefix: 'OTY' })
export const offerLocationRepo = new FirestoreRepo('offer_locations',   { idPrefix: 'OLC' })
