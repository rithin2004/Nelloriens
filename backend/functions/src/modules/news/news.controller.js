import * as svc from './news.service.js'
import { log }  from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await svc.incrementNewsViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementCardViews(req, res) {
  await svc.incrementNewsViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}

// ── Articles ───────────────────────────────────────────────────────────────

export async function listNews(req, res) {
  const { items, total, page, totalPages } = await svc.listNews(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function getNews(req, res) {
  const data = await svc.getNewsById(req.params.id)
  res.json({ success: true, message: 'OK', data })
}

export async function createNews(req, res) {
  const data = await svc.createNewsArticle({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'news', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateNews(req, res) {
  const data = await svc.updateNewsArticle(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'news', req.params.id, { title: req.body.title })
  res.json({ success: true, message: 'Updated', data })
}

export async function deleteNews(req, res) {
  const item = await svc.deleteNewsArticle(req.params.id)
  await log(req, 'delete', 'news', req.params.id, { title: item.title })
  res.json({ success: true, message: 'Moved to Recycle Bin', data: null })
}

export async function bulkDelete(req, res) {
  const count = await svc.bulkDeleteNews(req.body.ids, req.user)
  await log(req, 'bulk_delete', 'news', null, { count })
  res.json({ success: true, message: `Moved ${count} articles to Recycle Bin`, data: null })
}

export async function bulkPublish(req, res) {
  const count = await svc.bulkPublishNews(req.body.ids)
  await log(req, 'bulk_publish', 'news', null, { count })
  res.json({ success: true, message: `Published ${count} articles`, data: null })
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function listCategories(req, res) {
  const data = await svc.listNewsCategories()
  res.json({ success: true, message: 'OK', data })
}

export async function createCategory(req, res) {
  const data = await svc.createNewsCategory(req.body.name)
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateCategory(req, res) {
  const data = await svc.updateNewsCategory(req.params.id, req.body.name)
  res.json({ success: true, message: 'Updated', data })
}

export async function deleteCategory(req, res) {
  await svc.deleteNewsCategory(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Breaking Points ────────────────────────────────────────────────────────

export async function listBreakingPoints(req, res) {
  const data = await svc.listBreakingPoints()
  res.json({ success: true, message: 'OK', data })
}

export async function createBreakingPoint(req, res) {
  const data = await svc.createBreakingPoint(req.body.text)
  await log(req, 'create', 'breaking_news', data._id, { text: data.text })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateBreakingPoint(req, res) {
  const data = await svc.updateBreakingPoint(req.params.id, req.body.text)
  await log(req, 'update', 'breaking_news', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function deleteBreakingPoint(req, res) {
  await svc.deleteBreakingPoint(req.params.id)
  await log(req, 'delete', 'breaking_news', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

export async function reorderBreakingPoints(req, res) {
  await svc.reorderBreakingPoints(req.body.ids)
  await log(req, 'reorder', 'breaking_news', null)
  res.json({ success: true, message: 'Reordered', data: null })
}
