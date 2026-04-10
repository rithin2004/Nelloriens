import * as svc from './news.service.js'
import { log }  from '../../utils/auditLog.js'

function handleErr(res, err) {
  const status = err.status || 500
  return res.status(status).json({ success: false, message: err.message || 'Server error' })
}

// ── Articles ───────────────────────────────────────────────────────────────

export async function listNews(req, res) {
  try {
    const result = await svc.listNews(req.query)
    res.json({ success: true, ...result })
  } catch (err) { handleErr(res, err) }
}

export async function getNews(req, res) {
  try {
    const data = await svc.getNewsById(req.params.id)
    res.json({ success: true, data })
  } catch (err) { handleErr(res, err) }
}

export async function createNews(req, res) {
  try {
    const data = await svc.createNewsArticle(req.body)
    await log(req, 'create', 'news', data._id, { title: data.title })
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function updateNews(req, res) {
  try {
    const data = await svc.updateNewsArticle(req.params.id, req.body)
    await log(req, 'update', 'news', req.params.id, { title: req.body.title })
    res.json({ success: true, message: 'Updated', data })
  } catch (err) { handleErr(res, err) }
}

export async function deleteNews(req, res) {
  try {
    const item = await svc.deleteNewsArticle(req.params.id)
    await log(req, 'delete', 'news', req.params.id, { title: item.title })
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}

export async function bulkDelete(req, res) {
  try {
    const count = await svc.bulkDeleteNews(req.body.ids)
    await log(req, 'bulk_delete', 'news', null, { count })
    res.json({ success: true, message: `Deleted ${count} articles` })
  } catch (err) { handleErr(res, err) }
}

export async function bulkPublish(req, res) {
  try {
    const count = await svc.bulkPublishNews(req.body.ids)
    await log(req, 'bulk_publish', 'news', null, { count })
    res.json({ success: true, message: `Published ${count} articles` })
  } catch (err) { handleErr(res, err) }
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function listCategories(req, res) {
  try {
    const data = await svc.listNewsCategories()
    res.json({ success: true, data })
  } catch (err) { handleErr(res, err) }
}

export async function createCategory(req, res) {
  try {
    const data = await svc.createNewsCategory(req.body.name)
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function updateCategory(req, res) {
  try {
    const data = await svc.updateNewsCategory(req.params.id, req.body.name)
    res.json({ success: true, data })
  } catch (err) { handleErr(res, err) }
}

export async function deleteCategory(req, res) {
  try {
    await svc.deleteNewsCategory(req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}

// ── Breaking Points ────────────────────────────────────────────────────────

export async function listBreakingPoints(req, res) {
  try {
    const data = await svc.listBreakingPoints()
    res.json({ success: true, data })
  } catch (err) { handleErr(res, err) }
}

export async function createBreakingPoint(req, res) {
  try {
    const data = await svc.createBreakingPoint(req.body.text)
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function updateBreakingPoint(req, res) {
  try {
    const data = await svc.updateBreakingPoint(req.params.id, req.body.text)
    res.json({ success: true, data })
  } catch (err) { handleErr(res, err) }
}

export async function deleteBreakingPoint(req, res) {
  try {
    await svc.deleteBreakingPoint(req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}

export async function reorderBreakingPoints(req, res) {
  try {
    await svc.reorderBreakingPoints(req.body.items)
    res.json({ success: true, message: 'Reordered' })
  } catch (err) { handleErr(res, err) }
}
