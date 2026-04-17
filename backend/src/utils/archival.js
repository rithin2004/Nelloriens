/**
 * Content Archival & Recycle Bin Purge  (RULE 9)
 *
 * Two scheduled jobs run daily at midnight:
 *
 * 1. archiveOldContent()
 *    Content older than 90 days (createdAt) → moved to the 'recyclebin' collection
 *    with reason: 'auto-90-days'. Original document is hard-deleted from its collection.
 *
 * 2. purgeExpiredBin()
 *    Items in the 'recyclebin' collection with deletedAt > 15 days ago → permanently deleted.
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
  { module: 'events',            collection: 'events',            titleField: 'title'     },
  { module: 'influencer_events', collection: 'influencer_events', titleField: 'title'     },
  { module: 'movies',         collection: 'movies',         titleField: 'title'     },
  { module: 'movie_trailers', collection: 'movie_trailers', titleField: 'movieName' },
  { module: 'theatres',       collection: 'theatres',       titleField: 'name'      },
  { module: 'transport',    collection: 'transport',    titleField: 'title'     },
  { module: 'offers',       collection: 'offers',       titleField: 'title'     },
  { module: 'tourism',      collection: 'tourism',      titleField: 'placeName' },
  { module: 'updates',      collection: 'updates',      titleField: 'title'     },
  { module: 'ads',          collection: 'ads',          titleField: 'title'     },
  { module: 'sponsorships', collection: 'sponsorships', titleField: 'title'     },
  { module: 'realestate',   collection: 'realestate',   titleField: 'title'     },
]

const ARCHIVE_DAYS  = 90    // days until live content is auto-moved to Recycle Bin
const PURGE_DAYS    = 15    // days a Recycle Bin item is kept before permanent deletion
const BATCH_SIZE    = 200   // keep well under Firestore's 500-op limit (2 ops per doc)
const RECYCLE_COL   = 'recyclebin'

/** ISO string for `daysAgo` days in the past */
function cutoffISO(daysAgo) {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
}

/**
 * Auto-archive: content older than ARCHIVE_DAYS.
 * Copies full document to 'recyclebin' with reason 'auto-90-days',
 * then hard-deletes from the source collection.
 */
export async function archiveOldContent() {
  const cutoff     = cutoffISO(ARCHIVE_DAYS)
  const now        = new Date().toISOString()
  let   totalMoved = 0

  for (const { module, collection, titleField } of CONTENT_MODULES) {
    try {
      const snap     = await db.collection(collection).where('createdAt', '<', cutoff).get()
      const toMove   = snap.docs
      if (!toMove.length) continue

      for (let i = 0; i < toMove.length; i += BATCH_SIZE) {
        const chunk = toMove.slice(i, i + BATCH_SIZE)
        const batch = db.batch()

        chunk.forEach(doc => {
          const data = doc.data()
          // Write full document to recyclebin
          batch.set(db.collection(RECYCLE_COL).doc(doc.id), {
            ...data,
            originalCollection:  collection,
            originalPublishedAt: data.publishedAt || data.createdAt || now,
            originalPublishedBy: data.publishedBy || null,
            deletedAt:           now,
            deletedBy:           null,   // system action
            reason:              'auto-90-days',
            _module:             module,
            _titleField:         titleField,
          })
          // Hard-delete from original collection
          batch.delete(doc.ref)
        })

        await batch.commit()
        totalMoved += chunk.length
      }

      console.log(`[archival] Auto-archived ${toMove.length} items from '${collection}'`)
    } catch (err) {
      console.error(`[archival] Error archiving '${collection}':`, err.message)
    }
  }

  if (totalMoved > 0) {
    console.log(`[archival] Total auto-archived: ${totalMoved} items`)
  }
}

/**
 * Purge: items in 'recyclebin' for more than PURGE_DAYS → permanently deleted.
 * Now reads directly from the recyclebin collection — single collection, simple query.
 */
export async function purgeExpiredBin() {
  const cutoff   = cutoffISO(PURGE_DAYS)
  let   totalDel = 0

  try {
    const snap     = await db.collection(RECYCLE_COL).get()
    const toDelete = snap.docs.filter(d => {
      const { deletedAt } = d.data()
      return deletedAt && deletedAt < cutoff
    })

    if (!toDelete.length) return

    for (let i = 0; i < toDelete.length; i += BATCH_SIZE * 2) {
      // Each doc is 1 delete op — use full BATCH_SIZE * 2 = 400 to stay safe
      const chunk = toDelete.slice(i, i + BATCH_SIZE * 2)
      const batch = db.batch()
      chunk.forEach(doc => batch.delete(doc.ref))
      await batch.commit()
      totalDel += chunk.length
    }

    console.log(`[archival] Purged ${totalDel} expired items from recyclebin`)
  } catch (err) {
    console.error('[archival] Error purging recyclebin:', err.message)
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
