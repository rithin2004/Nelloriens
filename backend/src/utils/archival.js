/**
 * Content Archival & Recycle Bin Purge
 *
 * Two scheduled jobs run daily at midnight:
 *
 * 1. archiveOldContent()
 *    Content older than 90 days (createdAt) → soft-deleted with deleteReason 'expired'.
 *    The item moves to the Recycle Bin where admins can restore it for 15 more days.
 *
 * 2. purgeExpiredBin()
 *    Items in the Recycle Bin (deletedAt set) for more than 15 days → permanently deleted.
 *
 * Only content collections are affected. Categories, locations, users, roles,
 * company, settings, and leads are never auto-archived.
 */

import { db } from '../config/firebase.js'

export const CONTENT_MODULES = [
  { module: 'news',         collection: 'news',         titleField: 'title'     },
  { module: 'jobs',         collection: 'jobs',         titleField: 'title'     },
  { module: 'results',      collection: 'results',      titleField: 'examName'  },
  { module: 'sports',       collection: 'sports',       titleField: 'title'     },
  { module: 'foods',        collection: 'foods',        titleField: 'foodName'  },
  { module: 'history',      collection: 'history',      titleField: 'title'     },
  { module: 'stays',        collection: 'stays',        titleField: 'hotelName' },
  { module: 'events',       collection: 'events',       titleField: 'title'     },
  { module: 'movies',       collection: 'movies',       titleField: 'title'     },
  { module: 'theatres',     collection: 'theatres',     titleField: 'name'      },
  { module: 'transport',    collection: 'transport',    titleField: 'title'     },
  { module: 'offers',       collection: 'offers',       titleField: 'title'     },
  { module: 'tourism',      collection: 'tourism',      titleField: 'title'     },
  { module: 'updates',      collection: 'updates',      titleField: 'title'     },
  { module: 'ads',          collection: 'ads',          titleField: 'title'     },
  { module: 'sponsorships', collection: 'sponsorships', titleField: 'title'     },
]

const ARCHIVE_DAYS = 90   // days until live content is auto-moved to Recycle Bin
const PURGE_DAYS   = 15   // days a Recycle Bin item is kept before permanent deletion
const BATCH_SIZE   = 200  // Firestore batch limit is 500 ops; keep headroom

/** ISO string for `daysAgo` days in the past */
function cutoffISO(daysAgo) {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
}

/**
 * Auto-archive: content older than ARCHIVE_DAYS → soft-deleted with reason 'expired'.
 * Admins can still see & restore these items from the Recycle Bin for PURGE_DAYS more days.
 */
export async function archiveOldContent() {
  const cutoff    = cutoffISO(ARCHIVE_DAYS)
  const now       = new Date().toISOString()
  let   totalMoved = 0

  for (const { module, collection } of CONTENT_MODULES) {
    try {
      // Fetch docs older than the cutoff that are NOT already soft-deleted
      const snap = await db.collection(collection)
        .where('createdAt', '<', cutoff)
        .get()

      // In-memory filter: skip already-deleted items
      const toArchive = snap.docs.filter(d => !d.data().deletedAt)
      if (!toArchive.length) continue

      for (let i = 0; i < toArchive.length; i += BATCH_SIZE) {
        const chunk = toArchive.slice(i, i + BATCH_SIZE)
        const batch = db.batch()
        chunk.forEach(doc => {
          batch.update(doc.ref, {
            deletedAt:    now,
            deletedBy:    null,       // system action
            deleteReason: 'expired',
            updatedAt:    now,
          })
        })
        await batch.commit()
        totalMoved += chunk.length
      }

      console.log(`[archival] Auto-archived ${toArchive.length} items from '${collection}'`)
    } catch (err) {
      console.error(`[archival] Error archiving '${collection}':`, err.message)
    }
  }

  if (totalMoved > 0) {
    console.log(`[archival] Total auto-archived: ${totalMoved} items`)
  }
}

/**
 * Purge: items in Recycle Bin for more than PURGE_DAYS → permanently deleted.
 */
export async function purgeExpiredBin() {
  const cutoff  = cutoffISO(PURGE_DAYS)
  let   totalDel = 0

  for (const { collection } of CONTENT_MODULES) {
    try {
      const snap = await db.collection(collection).get()

      // In-memory filter: deleted and expired
      const toDelete = snap.docs.filter(d => {
        const data = d.data()
        return data.deletedAt && data.deletedAt < cutoff
      })

      if (!toDelete.length) continue

      for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
        const chunk = toDelete.slice(i, i + BATCH_SIZE)
        const batch = db.batch()
        chunk.forEach(doc => batch.delete(doc.ref))
        await batch.commit()
        totalDel += chunk.length
      }

      console.log(`[archival] Purged ${toDelete.length} expired items from '${collection}'`)
    } catch (err) {
      console.error(`[archival] Error purging '${collection}':`, err.message)
    }
  }

  if (totalDel > 0) {
    console.log(`[archival] Total purged: ${totalDel} items`)
  }
}

/**
 * Run archive + purge once, then schedule daily at midnight.
 */
export function startArchivalScheduler() {
  const runAll = async () => {
    console.log('[archival] Running scheduled archive & purge…')
    await archiveOldContent()
    await purgeExpiredBin()
    console.log('[archival] Done.')
  }

  // Run once at startup (catches up on any missed runs)
  runAll().catch((err) => console.error('[archival] Startup run failed:', err.message))

  // Schedule at next midnight, then every 24 h
  const now             = new Date()
  const nextMidnight    = new Date(now)
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
