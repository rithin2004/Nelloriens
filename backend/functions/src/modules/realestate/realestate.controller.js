import { realEstateService, realEstateLocService, realEstateTypeService } from './realestate.service.js'
import { log }             from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

// ── Listings ──────────────────────────────────────────────────────────────────

export async function list(req, res) {
  res.json({ success: true, ...(await realEstateService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await realEstateService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await realEstateService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'realestate', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await realEstateService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'realestate', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await realEstateService.remove(req.params.id, req.user)
  await log(req, 'delete', 'realestate', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

// ── Locations ─────────────────────────────────────────────────────────────────

export async function listLocations(req, res) {
  res.json(await realEstateLocService.list())
}

export async function createLocation(req, res) {
  const data = await realEstateLocService.create(req.body.name)
  res.status(201).json({ success: true, data })
}

export async function updateLocation(req, res) {
  const data = await realEstateLocService.update(req.params.id, req.body.name)
  res.json({ success: true, data })
}

export async function deleteLocation(req, res) {
  await realEstateLocService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

// ── Property Types ────────────────────────────────────────────────────────────

export async function listTypes(req, res) {
  res.json(await realEstateTypeService.list())
}

export async function createType(req, res) {
  const data = await realEstateTypeService.create(req.body.name)
  res.status(201).json({ success: true, data })
}

export async function updateType(req, res) {
  const data = await realEstateTypeService.update(req.params.id, req.body.name)
  res.json({ success: true, data })
}

export async function deleteType(req, res) {
  await realEstateTypeService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────

export async function incrementPageViews(req, res) {
  await realEstateService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true })
}

export async function incrementCardViews(req, res) {
  await realEstateService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true })
}
