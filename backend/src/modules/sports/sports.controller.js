import { sportsService, sportCatService } from './sports.service.js'
import { handleErr } from '../../utils/serviceBase.js'
import { log }       from '../../utils/auditLog.js'

export async function list(req, res) {
  try { res.json({ success: true, ...(await sportsService.list(req.query)) }) }
  catch (err) { handleErr(res, err) }
}

export async function getById(req, res) {
  try { res.json({ success: true, data: await sportsService.getById(req.params.id) }) }
  catch (err) { handleErr(res, err) }
}

export async function create(req, res) {
  try {
    const data = await sportsService.create(req.body)
    await log(req, 'create', 'sports', data._id, { title: data.title })
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function update(req, res) {
  try {
    const data = await sportsService.update(req.params.id, req.body)
    await log(req, 'update', 'sports', req.params.id)
    res.json({ success: true, message: 'Updated', data })
  } catch (err) { handleErr(res, err) }
}

export async function remove(req, res) {
  try {
    await sportsService.remove(req.params.id)
    await log(req, 'delete', 'sports', req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}

export async function listCategories(req, res) {
  try { res.json({ success: true, data: await sportCatService.list() }) }
  catch (err) { handleErr(res, err) }
}

export async function createCategory(req, res) {
  try { res.status(201).json({ success: true, data: await sportCatService.create(req.body.name) }) }
  catch (err) { handleErr(res, err) }
}

export async function updateCategory(req, res) {
  try { res.json({ success: true, data: await sportCatService.update(req.params.id, req.body.name) }) }
  catch (err) { handleErr(res, err) }
}

export async function deleteCategory(req, res) {
  try { await sportCatService.remove(req.params.id); res.json({ success: true, message: 'Deleted' }) }
  catch (err) { handleErr(res, err) }
}
