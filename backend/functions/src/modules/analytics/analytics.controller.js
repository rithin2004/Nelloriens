import { db } from '../../config/firebase.js'
import admin   from '../../config/firebase.js'

const VALID_MODULES = new Set([
  'news', 'events', 'updates', 'history', 'transport', 'foods',
  'stays', 'tourism', 'offers', 'movies', 'theatres', 'sports',
  'realestate', 'results', 'jobs', 'ads', 'sponsorships', 'instagram',
  'leads', 'company',
])

export const recordPageVisit = async (req, res) => {
  const { module } = req.body
  if (!module || !VALID_MODULES.has(module)) {
    return res.status(400).json({ success: false, message: 'Invalid module' })
  }

  await db.collection('analytics').doc(module).set(
    { pageViews: admin.firestore.FieldValue.increment(1) },
    { merge: true }
  )

  res.json({ success: true })
}

export const getPageViews = async (_req, res) => {
  const snap = await db.collection('analytics').get()
  const data = {}
  snap.forEach((doc) => { data[doc.id] = doc.data().pageViews || 0 })
  res.json({ success: true, data })
}
