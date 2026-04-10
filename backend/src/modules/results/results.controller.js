import { resultsService, resultCatService } from './results.service.js'
import { handleErr } from '../../utils/serviceBase.js'
import { log }       from '../../utils/auditLog.js'

// ── Results ────────────────────────────────────────────────────────────────

export async function list(req, res) {
  try { res.json({ success: true, ...(await resultsService.list(req.query)) }) }
  catch (err) { handleErr(res, err) }
}

export async function getById(req, res) {
  try { res.json({ success: true, data: await resultsService.getById(req.params.id) }) }
  catch (err) { handleErr(res, err) }
}

export async function create(req, res) {
  try {
    const data = await resultsService.create(req.body)
    await log(req, 'create', 'results', data._id, { title: data.title })
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function update(req, res) {
  try {
    const data = await resultsService.update(req.params.id, req.body)
    await log(req, 'update', 'results', req.params.id)
    res.json({ success: true, message: 'Updated', data })
  } catch (err) { handleErr(res, err) }
}

export async function remove(req, res) {
  try {
    await resultsService.remove(req.params.id)
    await log(req, 'delete', 'results', req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function listCategories(req, res) {
  try { res.json({ success: true, data: await resultCatService.list() }) }
  catch (err) { handleErr(res, err) }
}

export async function createCategory(req, res) {
  try { res.status(201).json({ success: true, data: await resultCatService.create(req.body.name) }) }
  catch (err) { handleErr(res, err) }
}

export async function updateCategory(req, res) {
  try { res.json({ success: true, data: await resultCatService.update(req.params.id, req.body.name) }) }
  catch (err) { handleErr(res, err) }
}

export async function deleteCategory(req, res) {
  try { await resultCatService.remove(req.params.id); res.json({ success: true, message: 'Deleted' }) }
  catch (err) { handleErr(res, err) }
}
