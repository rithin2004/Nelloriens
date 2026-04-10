import { tourismService, tourismCatService } from './tourism.service.js'
import { handleErr } from '../../utils/serviceBase.js'
import { log }       from '../../utils/auditLog.js'

export async function list(req, res) {
  try { res.json({ success: true, ...(await tourismService.list(req.query)) }) }
  catch (err) { handleErr(res, err) }
}

export async function getById(req, res) {
  try { res.json({ success: true, data: await tourismService.getById(req.params.id) }) }
  catch (err) { handleErr(res, err) }
}

export async function create(req, res) {
  try {
    const data = await tourismService.create(req.body)
    await log(req, 'create', 'tourism', data._id, { title: data.title })
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function update(req, res) {
  try {
    const data = await tourismService.update(req.params.id, req.body)
    await log(req, 'update', 'tourism', req.params.id)
    res.json({ success: true, message: 'Updated', data })
  } catch (err) { handleErr(res, err) }
}

export async function remove(req, res) {
  try {
    await tourismService.remove(req.params.id)
    await log(req, 'delete', 'tourism', req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}

export async function listCategories(req, res) {
  try { res.json({ success: true, data: await tourismCatService.list() }) }
  catch (err) { handleErr(res, err) }
}

export async function createCategory(req, res) {
  try { res.status(201).json({ success: true, data: await tourismCatService.create(req.body.name) }) }
  catch (err) { handleErr(res, err) }
}

export async function updateCategory(req, res) {
  try { res.json({ success: true, data: await tourismCatService.update(req.params.id, req.body.name) }) }
  catch (err) { handleErr(res, err) }
}

export async function deleteCategory(req, res) {
  try { await tourismCatService.remove(req.params.id); res.json({ success: true, message: 'Deleted' }) }
  catch (err) { handleErr(res, err) }
}
