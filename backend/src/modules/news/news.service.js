import { newsRepo, newsCatRepo, bpRepo } from './news.repository.js'

// ── Articles ───────────────────────────────────────────────────────────────

export async function listNews({ page, limit, search, category, isImportant }) {
  if (search) {
    const all = await newsRepo.searchByTitle(search)
    const lim = Math.min(parseInt(limit) || 20, 100)
    const pg  = Math.max(parseInt(page) || 1, 1)
    const items = all.slice((pg - 1) * lim, pg * lim)
    return { items, total: all.length, page: pg, totalPages: Math.max(1, Math.ceil(all.length / lim)) }
  }

  const filters = []
  if (category)                  filters.push(['category', '==', category])
  if (isImportant === 'true')    filters.push(['isImportant', '==', true])

  return newsRepo.paginate({ page, limit, orderBy: 'publishedAt', order: 'desc', filters })
}

export async function getNewsById(id) {
  const article = await newsRepo.findById(id)
  if (!article) throw { status: 404, message: 'News article not found' }
  return article
}

export async function createNewsArticle(data) {
  if (!data.title?.trim()) throw { status: 400, message: 'title is required' }
  return newsRepo.create({ ...data, viewCount: 0 })
}

export async function updateNewsArticle(id, data) {
  const existing = await newsRepo.findById(id)
  if (!existing) throw { status: 404, message: 'News article not found' }
  return newsRepo.update(id, data)
}

export async function deleteNewsArticle(id) {
  const existing = await newsRepo.findById(id)
  if (!existing) throw { status: 404, message: 'News article not found' }
  await newsRepo.delete(id)
  return existing
}

export async function bulkDeleteNews(ids) {
  if (!Array.isArray(ids) || !ids.length) throw { status: 400, message: 'ids array required' }
  return newsRepo.batchDelete(ids)
}

export async function bulkPublishNews(ids) {
  if (!Array.isArray(ids) || !ids.length) throw { status: 400, message: 'ids array required' }
  return newsRepo.batchPublish(ids)
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
}

export async function reorderBreakingPoints(items) {
  if (!Array.isArray(items)) throw { status: 400, message: 'items array required' }
  await bpRepo.reorder(items)
}
