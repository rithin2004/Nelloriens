import { resultsService, resultCatService } from './results.service.js'
import { log } from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

export async function list(req, res) {
  const { items, total, page, totalPages } = await resultsService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function getById(req, res) {
  const data = await resultsService.getById(req.params.id)
  res.json({ success: true, message: 'OK', data })
}

export async function create(req, res) {
  const data = await resultsService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'results', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await resultsService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'results', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await resultsService.remove(req.params.id)
  await log(req, 'delete', 'results', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

export async function listCategories(req, res) {
  const data = await resultCatService.list()
  res.json({ success: true, message: 'OK', data })
}

export async function createCategory(req, res) {
  const data = await resultCatService.create(req.body.name)
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateCategory(req, res) {
  const data = await resultCatService.update(req.params.id, req.body.name)
  res.json({ success: true, message: 'Updated', data })
}

export async function deleteCategory(req, res) {
  await resultCatService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await resultsService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementCardViews(req, res) {
  await resultsService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
