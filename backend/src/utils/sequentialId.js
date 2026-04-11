import { db } from '../config/firebase.js'

/**
 * Returns the next sequential ID for a given prefix.
 * Uses a Firestore transaction to atomically increment the counter.
 * Counter document: counters/{prefix} with field { current: 0 }
 * Resulting ID format: PREFIX + zero-padded 5-digit number (e.g. NEWS00001)
 */
export async function nextId(prefix) {
  const counterRef = db.collection('counters').doc(prefix)

  const next = await db.runTransaction(async (tx) => {
    const snap    = await tx.get(counterRef)
    const current = snap.exists ? (snap.data().current || 0) : 0
    const n       = current + 1
    tx.set(counterRef, { current: n }, { merge: true })
    return n
  })

  return `${prefix}${String(next).padStart(5, '0')}`
}
