import { staysService, stayCatService, stayLocService } from './stays.service.js'
import { log }          from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

export async function list(req, res) {
  const { items, total, page, totalPages } = await staysService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function getById(req, res) {
  const data = await staysService.getById(req.params.id)
  res.json({ success: true, message: 'OK', data })
}

export async function create(req, res) {
  const data = await staysService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'stays', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await staysService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'stays', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await staysService.remove(req.params.id)
  await log(req, 'delete', 'stays', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Categories ─────────────────────────────────────────────────────────────
export async function listCategories(req, res) {
  const data = await stayCatService.list()
  res.json({ success: true, message: 'OK', data })
}
export async function createCategory(req, res) {
  const data = await stayCatService.create(req.body.name)
  res.status(201).json({ success: true, message: 'Created', data })
}
export async function updateCategory(req, res) {
  const data = await stayCatService.update(req.params.id, req.body.name)
  res.json({ success: true, message: 'Updated', data })
}
export async function deleteCategory(req, res) {
  await stayCatService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Locations ──────────────────────────────────────────────────────────────
export async function listLocations(req, res) {
  const data = await stayLocService.list()
  res.json({ success: true, message: 'OK', data })
}
export async function createLocation(req, res) {
  const data = await stayLocService.create(req.body.name)
  res.status(201).json({ success: true, message: 'Created', data })
}
export async function updateLocation(req, res) {
  const data = await stayLocService.update(req.params.id, req.body.name)
  res.json({ success: true, message: 'Updated', data })
}
export async function deleteLocation(req, res) {
  await stayLocService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await staysService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementCardViews(req, res) {
  await staysService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
