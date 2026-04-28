import admin from 'firebase-admin'

/**
 * Verifies the Firebase App Check token sent as X-Firebase-AppCheck header.
 * In development (NODE_ENV !== 'production') the check is skipped so local
 * development works without a real reCAPTCHA site key.
 * In production, requests without a valid token are rejected with 401.
 */
export const verifyAppCheck = async (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') return next()

  const token = req.headers['x-firebase-appcheck']
  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing App Check token' })
  }

  try {
    await admin.appCheck().verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid App Check token' })
  }
}
