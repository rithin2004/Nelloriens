import { offersService, offerCatService, offerTypeService, offerLocService } from './offers.service.js'
import { log }           from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

export async function list(req, res) {
  const { items, total, page, totalPages } = await offersService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function getById(req, res) {
  const data = await offersService.getById(req.params.id)
  res.json({ success: true, message: 'OK', data })
}

export async function create(req, res) {
  const data = await offersService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'offers', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await offersService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'offers', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await offersService.remove(req.params.id)
  await log(req, 'delete', 'offers', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function listCategories(req, res) {
  const data = await offerCatService.list()
  res.json({ success: true, message: 'OK', data })
}

export async function createCategory(req, res) {
  const data = await offerCatService.create(req.body.name)
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateCategory(req, res) {
  const data = await offerCatService.update(req.params.id, req.body.name)
  res.json({ success: true, message: 'Updated', data })
}

export async function deleteCategory(req, res) {
  await offerCatService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Offer Types ────────────────────────────────────────────────────────────

export async function listOfferTypes(req, res) {
  const data = await offerTypeService.list()
  res.json({ success: true, message: 'OK', data })
}
export async function createOfferType(req, res) {
  const data = await offerTypeService.create(req.body.name)
  res.status(201).json({ success: true, message: 'Created', data })
}
export async function updateOfferType(req, res) {
  const data = await offerTypeService.update(req.params.id, req.body.name)
  res.json({ success: true, message: 'Updated', data })
}
export async function deleteOfferType(req, res) {
  await offerTypeService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Locations ──────────────────────────────────────────────────────────────

export async function listLocations(req, res) {
  const data = await offerLocService.list()
  res.json({ success: true, message: 'OK', data })
}
export async function createLocation(req, res) {
  const data = await offerLocService.create(req.body.name)
  res.status(201).json({ success: true, message: 'Created', data })
}
export async function updateLocation(req, res) {
  const data = await offerLocService.update(req.params.id, req.body.name)
  res.json({ success: true, message: 'Updated', data })
}
export async function deleteLocation(req, res) {
  await offerLocService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await offersService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementCardViews(req, res) {
  await offersService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
