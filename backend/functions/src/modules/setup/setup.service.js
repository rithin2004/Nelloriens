import { db, auth }  from '../../config/firebase.js'
import { badReq, forbidden } from '../../utils/serviceBase.js'
import crypto        from 'crypto'

const SUPERADMIN_ROLE_ID = 'ROL00001'
const SUPERADMIN_USER_ID = 'USR00001'
const SETUP_SECRET       = process.env.SETUP_SECRET

/**
 * Check whether the superadmin has been created yet.
 * Returns { initialized: boolean }
 */
export async function getSetupStatus() {
  const snap = await db.collection('roles').doc(SUPERADMIN_ROLE_ID).get()
  return { initialized: snap.exists }
}

/**
 * Bootstrap the system:
 *  1. Verify secret
 *  2. Delete existing users / roles / counters data + Firebase Auth users
 *  3. Create superadmin role  (ROL00001)
 *  4. Create Firebase Auth user for superadmin
 *  5. Generate password reset link
 *  6. Create superadmin user doc (USR00001)
 * Returns { user, resetLink }
 */
export async function createSuperadmin(data) {
  const { secret, name, email, phone = '' } = data

  // Timing-safe comparison — prevents brute-force timing attacks
  if (!SETUP_SECRET) forbidden('SETUP_SECRET is not configured on this server')
  const providedBuf = Buffer.from(secret          || '', 'utf8')
  const expectedBuf = Buffer.from(SETUP_SECRET              , 'utf8')
  const safeEqual   = providedBuf.length === expectedBuf.length &&
                      crypto.timingSafeEqual(providedBuf, expectedBuf)
  if (!safeEqual) forbidden('Invalid setup secret')
  if (!email?.trim()) badReq('email is required')
  if (!name?.trim())  badReq('name is required')

  // ── Wipe users / roles / counters collections ──────────────────────────
  await _deleteCollection('users')
  await _deleteCollection('roles')
  await _deleteCollection('counters')

  // Wipe all Firebase Auth users
  await _deleteAllAuthUsers()

  // ── Create superadmin role at ROL00001 ─────────────────────────────────
  const now = new Date().toISOString()
  await db.collection('roles').doc(SUPERADMIN_ROLE_ID).set({
    name:        'superadmin',
    permissions: {},          // superadmin bypasses checks — permissions unused
    createdAt:   now,
    updatedAt:   now,
  })

  // Seed counters so next ROL / USR IDs continue from 1
  await db.collection('counters').doc('ROL').set({ current: 1 })
  await db.collection('counters').doc('USR').set({ current: 1 })

  // ── Create Firebase Auth user (no password — uses reset link) ──────────
  const userRecord = await auth.createUser({
    email:       email.trim(),
    displayName: name.trim(),
  })

  // ── Create superadmin user doc at USR00001 ─────────────────────────────
  await db.collection('users').doc(SUPERADMIN_USER_ID).set({
    firebaseUid: userRecord.uid,
    email:       email.trim(),
    name:        name.trim(),
    phone:       phone.trim(),
    roleId:      SUPERADMIN_ROLE_ID,
    roleName:    'superadmin',
    active:      true,
    createdAt:   now,
    updatedAt:   now,
  })

  // Password reset email is sent by the frontend via Firebase client SDK
  // (sendPasswordResetEmail) — no link is generated or exposed here.
  return {
    user: { _id: SUPERADMIN_USER_ID, email: email.trim(), name: name.trim() },
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

async function _deleteCollection(name) {
  // Firestore batch limit is 500 — chunk deletions to avoid that limit
  const CHUNK = 500
  let snap = await db.collection(name).limit(CHUNK).get()
  while (!snap.empty) {
    const batch = db.batch()
    snap.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
    if (snap.size < CHUNK) break
    snap = await db.collection(name).limit(CHUNK).get()
  }
}

async function _deleteAllAuthUsers() {
  let pageToken
  do {
    const result = await auth.listUsers(1000, pageToken)
    if (result.users.length > 0) {
      await auth.deleteUsers(result.users.map(u => u.uid))
    }
    pageToken = result.pageToken
  } while (pageToken)
}
