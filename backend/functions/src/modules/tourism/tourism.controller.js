import { tourismService, tourismCatService, tourismLocService, tourismPhotosService } from './tourism.service.js'
import { log }             from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

// ── Tourist Places ────────────────────────────────────────────────────────────

export async function list(req, res) {
  const { items, total, page, totalPages } = await tourismService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function getById(req, res) {
  const data = await tourismService.getById(req.params.id)
  res.json({ success: true, message: 'OK', data })
}

export async function create(req, res) {
  const data = await tourismService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'tourism', data._id, { title: data.placeName })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await tourismService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'tourism', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await tourismService.remove(req.params.id, req.user)
  await log(req, 'delete', 'tourism', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function listCategories(req, res) {
  const data = await tourismCatService.list()
  res.json({ success: true, message: 'OK', data })
}

export async function createCategory(req, res) {
  const data = await tourismCatService.create(req.body.name)
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateCategory(req, res) {
  const data = await tourismCatService.update(req.params.id, req.body.name)
  res.json({ success: true, message: 'Updated', data })
}

export async function deleteCategory(req, res) {
  await tourismCatService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Locations ─────────────────────────────────────────────────────────────────

export async function listLocations(req, res) {
  const data = await tourismLocService.list()
  res.json({ success: true, message: 'OK', data })
}

export async function createLocation(req, res) {
  const data = await tourismLocService.create(req.body.name)
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateLocation(req, res) {
  const data = await tourismLocService.update(req.params.id, req.body.name)
  res.json({ success: true, message: 'Updated', data })
}

export async function deleteLocation(req, res) {
  await tourismLocService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Display Photos ────────────────────────────────────────────────────────────

export async function listDisplayPhotos(req, res) {
  const data = await tourismPhotosService.list()
  res.json({ success: true, message: 'OK', data })
}

export async function createDisplayPhoto(req, res) {
  const data = await tourismPhotosService.create(req.body)
  await log(req, 'create', 'tourism_display_photos', data._id, { url: data.url })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateDisplayPhoto(req, res) {
  const data = await tourismPhotosService.update(req.params.id, req.body)
  await log(req, 'update', 'tourism_display_photos', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function deleteDisplayPhoto(req, res) {
  await tourismPhotosService.remove(req.params.id)
  await log(req, 'delete', 'tourism_display_photos', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

export async function reorderDisplayPhotos(req, res) {
  await tourismPhotosService.reorder(req.body.ids)
  await log(req, 'reorder', 'tourism_display_photos', null)
  res.json({ success: true, message: 'Reordered', data: null })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────

export async function incrementPageViews(req, res) {
  await tourismService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}

export async function incrementCardViews(req, res) {
  await tourismService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
