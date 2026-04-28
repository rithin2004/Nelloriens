import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const eventsRepo            = new FirestoreRepo('events',             { idPrefix: 'EVT' })
export const eventCatRepo          = new FirestoreRepo('event_categories',   { idPrefix: 'ECT' })
export const eventLocationRepo     = new FirestoreRepo('event_locations',    { idPrefix: 'ELC' })
// RULE 27 — Influencer events are a completely separate section (no categories, max 5 globally)
export const influencerEventsRepo  = new FirestoreRepo('influencer_events',  { idPrefix: 'EVT' })
