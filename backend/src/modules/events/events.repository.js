import { FirestoreRepo } from '../../utils/firestoreRepo.js'
export const eventsRepo   = new FirestoreRepo('events')
export const eventCatRepo = new FirestoreRepo('event_categories')
