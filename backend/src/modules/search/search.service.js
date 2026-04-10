import { db } from '../../config/firebase.js'

const SEARCHABLE = [
  { col: 'news',      fields: ['title', 'summary'] },
  { col: 'jobs',      fields: ['title', 'company']  },
  { col: 'results',   fields: ['title']             },
  { col: 'sports',    fields: ['title']             },
  { col: 'events',    fields: ['title', 'venue']    },
  { col: 'stays',     fields: ['title', 'location'] },
  { col: 'tourism',   fields: ['title', 'location'] },
  { col: 'updates',   fields: ['title']             },
  { col: 'transport', fields: ['title', 'operator'] },
  { col: 'offers',    fields: ['title']             },
  { col: 'history',   fields: ['title', 'year']     },
]

export async function globalSearch(q = '', limit = 20) {
  if (!q.trim()) return []

  const lower = q.toLowerCase()
  const results = []

  await Promise.all(SEARCHABLE.map(async ({ col, fields }) => {
    const snap = await db.collection(col).orderBy('createdAt', 'desc').limit(200).get()
    snap.docs.forEach(d => {
      const data = d.data()
      const match = fields.some(f => String(data[f] || '').toLowerCase().includes(lower))
      if (match) results.push({ _id: d.id, _collection: col, ...data })
    })
  }))

  return results.slice(0, Math.min(parseInt(limit) || 20, 100))
}
