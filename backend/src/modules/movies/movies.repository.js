import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const moviesRepo   = new FirestoreRepo('movies',         { idPrefix: 'MOV' })
export const theatresRepo = new FirestoreRepo('theatres',       { idPrefix: 'THT' })
export const trailersRepo = new FirestoreRepo('movie_trailers', { idPrefix: 'MOV' })
