import { foodsService, photosService, varietiesService, sweetsService, healthTipsService } from './foods.service.js'
import { log } from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

// ── Foods CRUD ─────────────────────────────────────────────────────────────

export async function list(req, res) {
  const { items, total, page, totalPages } = await foodsService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function getById(req, res) {
  const data = await foodsService.getById(req.params.id)
  res.json({ success: true, message: 'OK', data })
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
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Photos ─────────────────────────────────────────────────────────────────

export async function listPhotos(req, res) {
  const data = await photosService.list()
  res.json({ success: true, message: 'OK', data })
}

export async function addPhoto(req, res) {
  const data = await photosService.add(req.body)
  res.status(201).json({ success: true, message: 'Added', data })
}

export async function deletePhoto(req, res) {
  await photosService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

export async function reorderPhotos(req, res) {
  await photosService.reorder(req.body.ids)
  res.json({ success: true, message: 'Reordered', data: null })
}

// ── Varieties ──────────────────────────────────────────────────────────────

export async function listVarieties(req, res) {
  const { items, total, page, totalPages } = await varietiesService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function createVariety(req, res) {
  const data = await varietiesService.create({ ...req.body, ...createTracking(req.user) })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateVariety(req, res) {
  const data = await varietiesService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  res.json({ success: true, message: 'Updated', data })
}

export async function deleteVariety(req, res) {
  await varietiesService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Sweets ─────────────────────────────────────────────────────────────────

export async function listSweets(req, res) {
  const { items, total, page, totalPages } = await sweetsService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function createSweet(req, res) {
  const data = await sweetsService.create({ ...req.body, ...createTracking(req.user) })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateSweet(req, res) {
  const data = await sweetsService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  res.json({ success: true, message: 'Updated', data })
}

export async function deleteSweet(req, res) {
  await sweetsService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Health Tips ────────────────────────────────────────────────────────────

export async function listHealthTips(req, res) {
  const { items, total, page, totalPages } = await healthTipsService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function createHealthTip(req, res) {
  const data = await healthTipsService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'foods', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateHealthTip(req, res) {
  const data = await healthTipsService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'foods', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function deleteHealthTip(req, res) {
  await healthTipsService.remove(req.params.id)
  await log(req, 'delete', 'foods', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await foodsService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementCardViews(req, res) {
  await foodsService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementVarietyPageViews(req, res) {
  await varietiesService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementVarietyCardViews(req, res) {
  await varietiesService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementSweetPageViews(req, res) {
  await sweetsService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementSweetCardViews(req, res) {
  await sweetsService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementHealthTipPageViews(req, res) {
  await healthTipsService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementHealthTipCardViews(req, res) {
  await healthTipsService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
