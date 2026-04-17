import { sportsService, sportCatService } from './sports.service.js'
import { log } from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

export async function list(req, res) {
  res.json({ success: true, ...(await sportsService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await sportsService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await sportsService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'sports', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await sportsService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'sports', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await sportsService.remove(req.params.id)
  await log(req, 'delete', 'sports', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

export async function listCategories(req, res) {
  res.json(await sportCatService.list())
}

export async function createCategory(req, res) {
  const data = await sportCatService.create(req.body.name)
  res.status(201).json({ success: true, data })
}

export async function updateCategory(req, res) {
  const data = await sportCatService.update(req.params.id, req.body.name)
  res.json({ success: true, data })
}

export async function deleteCategory(req, res) {
  await sportCatService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await sportsService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true })
}
export async function incrementCardViews(req, res) {
  await sportsService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true })
}
