import admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential:    admin.credential.applicationDefault(),
    projectId:     process.env.GOOGLE_CLOUD_PROJECT,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
}

export const db     = admin.firestore()
export const bucket = admin.storage().bucket()
export const auth   = admin.auth()
export default admin
