import { auth, db } from '../config/firebase.js'

/**
 * Verifies the Firebase ID token in the Authorization header.
 * Attaches `req.user` with uid, email, role, and permissions.
 */
export async function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized — missing token' })
  }

  const token = header.slice(7)
  try {
    const decoded = await auth.verifyIdToken(token)
    const uid     = decoded.uid

    // Fetch admin record from Firestore
    const snap = await db.collection('admins').doc(uid).get()
    if (!snap.exists) {
      return res.status(403).json({ success: false, message: 'Access denied — not an admin' })
    }

    const data = snap.data()
    if (data.active === false) {
      return res.status(403).json({ success: false, message: 'Account is inactive' })
    }

    req.user = {
      uid,
      email:       decoded.email || data.email,
      role:        data.role || 'admin',
      permissions: data.permissions || {},
      name:        data.name || decoded.name || '',
    }

    next()
  } catch (err) {
    if (err.code?.startsWith('auth/')) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' })
    }
    next(err)
  }
}
