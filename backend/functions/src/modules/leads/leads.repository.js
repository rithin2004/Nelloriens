import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const leadsRepo           = new FirestoreRepo('leads',            { idPrefix: 'LED' })
export const leadInquiryTypeRepo = new FirestoreRepo('lead_inquiry_types', { idPrefix: 'LIT' })
