import { jobsService, jobCatService, jobLocService } from './jobs.service.js'
import { log } from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

// ── Jobs ───────────────────────────────────────────────────────────────────

export async function list(req, res) {
  res.json({ success: true, ...(await jobsService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await jobsService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await jobsService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'jobs', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await jobsService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'jobs', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await jobsService.remove(req.params.id)
  await log(req, 'delete', 'jobs', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function listCategories(req, res) {
  res.json(await jobCatService.list())
}

export async function createCategory(req, res) {
  const data = await jobCatService.create(req.body.name)
  res.status(201).json({ success: true, data })
}

export async function updateCategory(req, res) {
  const data = await jobCatService.update(req.params.id, req.body.name)
  res.json({ success: true, data })
}

export async function deleteCategory(req, res) {
  await jobCatService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

// ── Locations ──────────────────────────────────────────────────────────────

export async function listLocations(req, res) {
  res.json(await jobLocService.list())
}

export async function createLocation(req, res) {
  const data = await jobLocService.create(req.body.name)
  res.status(201).json({ success: true, data })
}

export async function updateLocation(req, res) {
  const data = await jobLocService.update(req.params.id, req.body.name)
  res.json({ success: true, data })
}

export async function deleteLocation(req, res) {
  await jobLocService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await jobsService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true })
}
export async function incrementCardViews(req, res) {
  await jobsService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true })
}
