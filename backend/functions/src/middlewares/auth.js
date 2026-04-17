import { auth, db } from '../config/firebase.js'

/**
 * Verifies the Firebase ID token in the Authorization header.
 * Attaches `req.user` with uid, email, roleId, roleName, and permissions.
 * Permissions come from the role document in the `roles` collection.
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

    // Fetch user from users collection (docs use sequential IDs; match by firebaseUid field)
    const snaps = await db.collection('users').where('firebaseUid', '==', uid).limit(1).get()
    if (snaps.empty) {
      return res.status(403).json({ success: false, message: 'Access denied — not an admin' })
    }
    const snap = snaps.docs[0]

    const data = snap.data()
    if (data.active === false) {
      return res.status(403).json({ success: false, message: 'Account is inactive' })
    }

    // Fetch role document for permissions
    let permissions = {}
    let roleName    = data.roleName || ''
    if (data.roleId) {
      const roleSnap = await db.collection('roles').doc(data.roleId).get()
      if (roleSnap.exists) {
        const role  = roleSnap.data()
        permissions = role.permissions || {}
        roleName    = role.name        || roleName
      }
    }

    req.user = {
      uid,
      email:       decoded.email || data.email,
      roleId:      data.roleId   || '',
      roleName,
      permissions,
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
