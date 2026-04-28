import { FirestoreRepo } from '../../utils/firestoreRepo.js'

export const moviesRepo     = new FirestoreRepo('movies',          { idPrefix: 'MOV' })
export const theatresRepo   = new FirestoreRepo('theatres',        { idPrefix: 'THT' })
export const showtimesRepo  = new FirestoreRepo('showtimes',       { idPrefix: 'SHW' })
export const movieGenreRepo = new FirestoreRepo('movie_genres',    { idPrefix: 'MGN' })
export const movieLangRepo  = new FirestoreRepo('movie_languages', { idPrefix: 'MLG' })
