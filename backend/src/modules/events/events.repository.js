import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const eventsRepo   = new FirestoreRepo('events',           { idPrefix: 'EVT' })
export const eventCatRepo = new FirestoreRepo('event_categories', { idPrefix: 'ECT' })
