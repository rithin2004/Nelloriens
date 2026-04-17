import { newsRepo, newsCatRepo, bpRepo } from './news.repository.js'

// ── Articles ───────────────────────────────────────────────────────────────

export async function listNews({ page, limit, search, category, isImportant }) {
  const safeLimit = Math.min(parseInt(limit) || 20, 100)
  const safePage  = Math.max(parseInt(page)  || 1, 1)

  // RULE 9: deleted items are in 'recyclebin' collection — no deletedAt filter needed
  let items = await newsRepo.findAll({ orderBy: 'publishedAt', order: 'desc' })

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(n => n.title?.toLowerCase().includes(q) || n.slug?.toLowerCase().includes(q))
  }
  if (category)                items = items.filter(n => n.category === category)
  if (isImportant === 'true')  items = items.filter(n => n.isImportant === true)
  if (isImportant === 'false') items = items.filter(n => n.isImportant !== true)

  const total = items.length
  return {
    items:      items.slice((safePage - 1) * safeLimit, safePage * safeLimit),
    total,
    page:       safePage,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  }
}

export async function incrementNewsViews(id, field) {
  await newsRepo.incrementField(id, field)
}

export async function getNewsById(id) {
  const article = await newsRepo.findById(id)
  if (!article) throw { status: 404, message: 'News article not found' }
  return article
}

export async function createNewsArticle(data) {
  if (!data.title?.trim()) throw { status: 400, message: 'title is required' }
  return newsRepo.create({ ...data, viewCount: 0, pageViews: 0, cardViews: 0 })
}

export async function updateNewsArticle(id, data) {
  const existing = await newsRepo.findById(id)
  if (!existing) throw { status: 404, message: 'News article not found' }

  // RULE 24 / RULE 13 — isImportant max 3 per category enforcement
  if (data.isImportant === true && !existing.isImportant) {
    const category = data.category || existing.category
    if (category) {
      const allArticles       = await newsRepo.findAll({ orderBy: 'publishedAt', order: 'desc' })
      const importantInCat    = allArticles.filter(n => n.isImportant === true && n.category === category && n._id !== id)
      if (importantInCat.length >= 3) {
        if (!data.replaceId) {
          const err = new Error('Maximum 3 Important articles per category reached. Choose one to replace.')
          err.status       = 409
          err.code         = 'MAX_LIMIT_REACHED'
          err.currentItems = importantInCat
          throw err
        }
        // replaceId provided — atomically unset the replaced article
        await newsRepo.update(data.replaceId, { isImportant: false })
      }
    }
  }

  const { replaceId: _replaceId, ...cleanData } = data
  return newsRepo.update(id, cleanData)
}

export async function deleteNewsArticle(id, requestUser = null) {
  const existing = await newsRepo.findById(id)
  if (!existing) throw { status: 404, message: 'News article not found' }
  await newsRepo.softDelete(id, {
    deletedBy: requestUser?.uid || null,
    reason:    'manual',
  })
  return existing
}

export async function bulkDeleteNews(ids, requestUser = null) {
  if (!Array.isArray(ids) || !ids.length) throw { status: 400, message: 'ids array required' }
  return newsRepo.batchSoftDelete(ids, {
    deletedBy: requestUser?.uid || null,
    reason:    'manual',
  })
}

export async function bulkPublishNews(ids) {
  if (!Array.isArray(ids) || !ids.length) throw { status: 400, message: 'ids array required' }
  return newsRepo.batchUpdate(ids, { publishedAt: new Date().toISOString() })
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function listNewsCategories() {
  return newsCatRepo.findAll({ orderBy: 'name', order: 'asc' })
}

export async function createNewsCategory(name) {
  if (!name?.trim()) throw { status: 400, message: 'name is required' }
  return newsCatRepo.create({ name: name.trim() })
}

export async function updateNewsCategory(id, name) {
  if (!name?.trim()) throw { status: 400, message: 'name is required' }
  const existing = await newsCatRepo.findById(id)
  if (!existing) throw { status: 404, message: 'Category not found' }
  return newsCatRepo.update(id, { name: name.trim() })
}

export async function deleteNewsCategory(id) {
  const existing = await newsCatRepo.findById(id)
  if (!existing) throw { status: 404, message: 'Category not found' }
  await newsCatRepo.delete(id)
}

// ── Breaking Points ────────────────────────────────────────────────────────

export async function listBreakingPoints() {
  return bpRepo.findAllOrdered()
}

export async function createBreakingPoint(text) {
  if (!text?.trim()) throw { status: 400, message: 'text is required' }
  // RULE 42 — max 25 breaking news points
  const all = await bpRepo.findAllOrdered()
  if (all.length >= 25) {
    const err = new Error('Maximum 25 breaking news points reached. Remove one before adding a new one.')
    err.status = 409
    err.code   = 'MAX_LIMIT_REACHED'
    err.currentItems = all
    throw err
  }
  const order = await bpRepo.getNextOrder()
  return bpRepo.create({ text: text.trim(), order })
}

export async function updateBreakingPoint(id, text) {
  const existing = await bpRepo.findById(id)
  if (!existing) throw { status: 404, message: 'Breaking point not found' }
  return bpRepo.update(id, { text: text?.trim() || existing.text })
}

export async function deleteBreakingPoint(id) {
  const existing = await bpRepo.findById(id)
  if (!existing) throw { status: 404, message: 'Breaking point not found' }
  await bpRepo.delete(id)
  await bpRepo.resequence()
}

export async function reorderBreakingPoints(ids) {
  if (!Array.isArray(ids)) throw { status: 400, message: 'ids must be an array' }
  if (!ids.length)         throw { status: 400, message: 'ids array is empty' }
  const all = await bpRepo.findAllOrdered()
  if (ids.length !== all.length) throw { status: 400, message: `Expected ${all.length} ids, got ${ids.length}` }
  await bpRepo.reorder(ids)
}
