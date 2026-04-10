import { foodsService, photosService, varietiesService, sweetsService } from './foods.service.js'
import { handleErr } from '../../utils/serviceBase.js'
import { log }       from '../../utils/auditLog.js'

// ── Foods CRUD ─────────────────────────────────────────────────────────────

export async function list(req, res) {
  try { res.json({ success: true, ...(await foodsService.list(req.query)) }) }
  catch (err) { handleErr(res, err) }
}

export async function getById(req, res) {
  try { res.json({ success: true, data: await foodsService.getById(req.params.id) }) }
  catch (err) { handleErr(res, err) }
}

export async function create(req, res) {
  try {
    const data = await foodsService.create(req.body)
    await log(req, 'create', 'foods', data._id, { title: data.title || data.name })
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function update(req, res) {
  try {
    const data = await foodsService.update(req.params.id, req.body)
    await log(req, 'update', 'foods', req.params.id)
    res.json({ success: true, message: 'Updated', data })
  } catch (err) { handleErr(res, err) }
}

export async function remove(req, res) {
  try {
    await foodsService.remove(req.params.id)
    await log(req, 'delete', 'foods', req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}

// ── Photos ─────────────────────────────────────────────────────────────────

export async function listPhotos(req, res) {
  try { res.json({ success: true, data: await photosService.list() }) }
  catch (err) { handleErr(res, err) }
}

export async function addPhoto(req, res) {
  try { res.status(201).json({ success: true, data: await photosService.add(req.body) }) }
  catch (err) { handleErr(res, err) }
}

export async function deletePhoto(req, res) {
  try { await photosService.remove(req.params.id); res.json({ success: true, message: 'Deleted' }) }
  catch (err) { handleErr(res, err) }
}

export async function reorderPhotos(req, res) {
  try { await photosService.reorder(req.body.items); res.json({ success: true, message: 'Reordered' }) }
  catch (err) { handleErr(res, err) }
}

// ── Varieties ──────────────────────────────────────────────────────────────

export async function listVarieties(req, res) {
  try { res.json({ success: true, data: await varietiesService.list() }) }
  catch (err) { handleErr(res, err) }
}

export async function createVariety(req, res) {
  try { res.status(201).json({ success: true, data: await varietiesService.create(req.body) }) }
  catch (err) { handleErr(res, err) }
}

export async function updateVariety(req, res) {
  try { res.json({ success: true, data: await varietiesService.update(req.params.id, req.body) }) }
  catch (err) { handleErr(res, err) }
}

export async function deleteVariety(req, res) {
  try { await varietiesService.remove(req.params.id); res.json({ success: true, message: 'Deleted' }) }
  catch (err) { handleErr(res, err) }
}

// ── Sweets ─────────────────────────────────────────────────────────────────

export async function listSweets(req, res) {
  try { res.json({ success: true, data: await sweetsService.list() }) }
  catch (err) { handleErr(res, err) }
}

export async function createSweet(req, res) {
  try { res.status(201).json({ success: true, data: await sweetsService.create(req.body) }) }
  catch (err) { handleErr(res, err) }
}

export async function updateSweet(req, res) {
  try { res.json({ success: true, data: await sweetsService.update(req.params.id, req.body) }) }
  catch (err) { handleErr(res, err) }
}

export async function deleteSweet(req, res) {
  try { await sweetsService.remove(req.params.id); res.json({ success: true, message: 'Deleted' }) }
  catch (err) { handleErr(res, err) }
}
