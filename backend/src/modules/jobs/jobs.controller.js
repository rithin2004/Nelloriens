import { jobsService, jobCatService, jobLocService } from './jobs.service.js'
import { handleErr } from '../../utils/serviceBase.js'
import { log }       from '../../utils/auditLog.js'

// ── Jobs ───────────────────────────────────────────────────────────────────

export async function list(req, res) {
  try { res.json({ success: true, ...(await jobsService.list(req.query)) }) }
  catch (err) { handleErr(res, err) }
}

export async function getById(req, res) {
  try { res.json({ success: true, data: await jobsService.getById(req.params.id) }) }
  catch (err) { handleErr(res, err) }
}

export async function create(req, res) {
  try {
    const data = await jobsService.create(req.body)
    await log(req, 'create', 'jobs', data._id, { title: data.title })
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function update(req, res) {
  try {
    const data = await jobsService.update(req.params.id, req.body)
    await log(req, 'update', 'jobs', req.params.id)
    res.json({ success: true, message: 'Updated', data })
  } catch (err) { handleErr(res, err) }
}

export async function remove(req, res) {
  try {
    await jobsService.remove(req.params.id)
    await log(req, 'delete', 'jobs', req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function listCategories(req, res) {
  try { res.json({ success: true, data: await jobCatService.list() }) }
  catch (err) { handleErr(res, err) }
}
export async function createCategory(req, res) {
  try { res.status(201).json({ success: true, data: await jobCatService.create(req.body.name) }) }
  catch (err) { handleErr(res, err) }
}
export async function updateCategory(req, res) {
  try { res.json({ success: true, data: await jobCatService.update(req.params.id, req.body.name) }) }
  catch (err) { handleErr(res, err) }
}
export async function deleteCategory(req, res) {
  try { await jobCatService.remove(req.params.id); res.json({ success: true, message: 'Deleted' }) }
  catch (err) { handleErr(res, err) }
}

// ── Locations ──────────────────────────────────────────────────────────────

export async function listLocations(req, res) {
  try { res.json({ success: true, data: await jobLocService.list() }) }
  catch (err) { handleErr(res, err) }
}
export async function createLocation(req, res) {
  try { res.status(201).json({ success: true, data: await jobLocService.create(req.body.name) }) }
  catch (err) { handleErr(res, err) }
}
export async function updateLocation(req, res) {
  try { res.json({ success: true, data: await jobLocService.update(req.params.id, req.body.name) }) }
  catch (err) { handleErr(res, err) }
}
export async function deleteLocation(req, res) {
  try { await jobLocService.remove(req.params.id); res.json({ success: true, message: 'Deleted' }) }
  catch (err) { handleErr(res, err) }
}
