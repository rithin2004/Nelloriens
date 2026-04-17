import { foodsService, photosService, varietiesService, sweetsService } from './foods.service.js'
import { log } from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

// ── Foods CRUD ─────────────────────────────────────────────────────────────

export async function list(req, res) {
  res.json({ success: true, ...(await foodsService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await foodsService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await foodsService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'foods', data._id, { title: data.title || data.name })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await foodsService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'foods', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await foodsService.remove(req.params.id)
  await log(req, 'delete', 'foods', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

// ── Photos ─────────────────────────────────────────────────────────────────

export async function listPhotos(req, res) {
  res.json(await photosService.list())
}

export async function addPhoto(req, res) {
  const data = await photosService.add(req.body)
  res.status(201).json({ success: true, data })
}

export async function deletePhoto(req, res) {
  await photosService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

export async function reorderPhotos(req, res) {
  await photosService.reorder(req.body.ids)
  res.json({ success: true, message: 'Reordered' })
}

// ── Varieties ──────────────────────────────────────────────────────────────

export async function listVarieties(req, res) {
  res.json(await varietiesService.list())
}

export async function createVariety(req, res) {
  const data = await varietiesService.create({ ...req.body, ...createTracking(req.user) })
  res.status(201).json({ success: true, data })
}

export async function updateVariety(req, res) {
  const data = await varietiesService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  res.json({ success: true, data })
}

export async function deleteVariety(req, res) {
  await varietiesService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

// ── Sweets ─────────────────────────────────────────────────────────────────

export async function listSweets(req, res) {
  res.json(await sweetsService.list())
}

export async function createSweet(req, res) {
  const data = await sweetsService.create({ ...req.body, ...createTracking(req.user) })
  res.status(201).json({ success: true, data })
}

export async function updateSweet(req, res) {
  const data = await sweetsService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  res.json({ success: true, data })
}

export async function deleteSweet(req, res) {
  await sweetsService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await foodsService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true })
}
export async function incrementCardViews(req, res) {
  await foodsService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true })
}
export async function incrementVarietyPageViews(req, res) {
  await varietiesService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true })
}
export async function incrementVarietyCardViews(req, res) {
  await varietiesService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true })
}
export async function incrementSweetPageViews(req, res) {
  await sweetsService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true })
}
export async function incrementSweetCardViews(req, res) {
  await sweetsService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true })
}
