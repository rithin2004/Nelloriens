import admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    storageBucket: process.env.FB_STORAGE_BUCKET,
  })
}

export const db     = admin.firestore()
export const bucket = admin.storage().bucket()
export const auth   = admin.auth()
export default admin
