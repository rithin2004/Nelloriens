/**
 * Content Archival & Purge
 *
 * Schedule:
 *   - Archive: docs older than 90 days → moved to `{collection}_archive`, tagged archivedAt
 *   - Purge:   docs in archive older than 30 days (archivedAt) → permanently deleted
 *
 * Skips all category / location / config / system collections.
 * Firestore batch limit = 500 ops; we stay well under it per flush.
 */

import { db } from '../config/firebase.js'

// Content collections subject to archival — categories, theatres, leads, etc. are excluded
const CONTENT_COLLECTIONS = [
  'news',
  'jobs',
  'results',
  'sports',
  'stays',
  'events',
  'movies',
  'transport',
  'offers',
  'tourism',
  'updates',
  'ads',
  'sponsorships',
  'history',
  'foods_sweets',
  'foods_photos',
]

const ARCHIVE_SUFFIX  = '_archive'
const ARCHIVE_DAYS    = 90   // days in live collection before archiving
const PURGE_DAYS      = 30   // days in archive before permanent deletion
const BATCH_SIZE      = 200  // Firestore batch limit is 500 ops; keep headroom

/** ISO string for `daysAgo` days in the past */
function cutoffISO(daysAgo) {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
}

/**
 * Move content older than ARCHIVE_DAYS from each live collection
 * into `{collection}_archive`, tagging each doc with `archivedAt`.
 */
export async function archiveOldContent() {
  const cutoff    = cutoffISO(ARCHIVE_DAYS)
  const archivedAt = new Date().toISOString()
  let   totalMoved = 0

  for (const col of CONTENT_COLLECTIONS) {
    try {
      const snap = await db.collection(col)
        .where('createdAt', '<', cutoff)
        .get()

      if (snap.empty) continue

      const docs    = snap.docs
      const archCol = db.collection(col + ARCHIVE_SUFFIX)

      // Process in batches: each doc = 1 write (archive) + 1 delete (live)
      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const chunk = docs.slice(i, i + BATCH_SIZE)
        const batch = db.batch()

        for (const doc of chunk) {
          batch.set(archCol.doc(doc.id), { ...doc.data(), archivedAt })
          batch.delete(db.collection(col).doc(doc.id))
        }

        await batch.commit()
        totalMoved += chunk.length
      }

      if (docs.length > 0) {
        console.log(`[archival] Archived ${docs.length} docs from '${col}'`)
      }
    } catch (err) {
      console.error(`[archival] Error archiving '${col}':`, err.message)
    }
  }

  if (totalMoved > 0) {
    console.log(`[archival] Total archived: ${totalMoved} documents`)
  }
}

/**
 * Permanently delete archive docs whose `archivedAt` is older than PURGE_DAYS.
 */
export async function purgeArchived() {
  const cutoff   = cutoffISO(PURGE_DAYS)
  let   totalDel = 0

  for (const col of CONTENT_COLLECTIONS) {
    const archColName = col + ARCHIVE_SUFFIX

    try {
      const snap = await db.collection(archColName)
        .where('archivedAt', '<', cutoff)
        .get()

      if (snap.empty) continue

      const docs = snap.docs

      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const chunk = docs.slice(i, i + BATCH_SIZE)
        const batch = db.batch()
        chunk.forEach((doc) => batch.delete(doc.ref))
        await batch.commit()
        totalDel += chunk.length
      }

      if (docs.length > 0) {
        console.log(`[archival] Purged ${docs.length} docs from '${archColName}'`)
      }
    } catch (err) {
      console.error(`[archival] Error purging '${archColName}':`, err.message)
    }
  }

  if (totalDel > 0) {
    console.log(`[archival] Total purged: ${totalDel} documents`)
  }
}

/**
 * Run archive + purge once, then schedule daily at midnight.
 */
export function startArchivalScheduler() {
  const runAll = async () => {
    console.log('[archival] Running scheduled archive & purge…')
    await archiveOldContent()
    await purgeArchived()
    console.log('[archival] Done.')
  }

  // Run once at startup (catches up on any missed runs)
  runAll().catch((err) => console.error('[archival] Startup run failed:', err.message))

  // Schedule at next midnight, then every 24 h
  const now          = new Date()
  const nextMidnight = new Date(now)
  nextMidnight.setHours(24, 0, 0, 0)
  const msUntilMidnight = nextMidnight - now

  setTimeout(() => {
    runAll().catch((err) => console.error('[archival] Scheduled run failed:', err.message))
    setInterval(
      () => runAll().catch((err) => console.error('[archival] Interval run failed:', err.message)),
      24 * 60 * 60 * 1000,
    )
  }, msUntilMidnight)

  console.log(
    `[archival] Scheduler started — next run at midnight (in ${Math.round(msUntilMidnight / 60000)} min)`
  )
}
