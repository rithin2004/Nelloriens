import { eventsService, eventCatService } from './events.service.js'
import { handleErr } from '../../utils/serviceBase.js'
import { log }       from '../../utils/auditLog.js'

export async function list(req, res) {
  try { res.json({ success: true, ...(await eventsService.list(req.query)) }) }
  catch (err) { handleErr(res, err) }
}

export async function getById(req, res) {
  try { res.json({ success: true, data: await eventsService.getById(req.params.id) }) }
  catch (err) { handleErr(res, err) }
}

export async function create(req, res) {
  try {
    const data = await eventsService.create(req.body)
    await log(req, 'create', 'events', data._id, { title: data.title })
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function update(req, res) {
  try {
    const data = await eventsService.update(req.params.id, req.body)
    await log(req, 'update', 'events', req.params.id)
    res.json({ success: true, message: 'Updated', data })
  } catch (err) { handleErr(res, err) }
}

export async function remove(req, res) {
  try {
    await eventsService.remove(req.params.id)
    await log(req, 'delete', 'events', req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}

export async function listCategories(req, res) {
  try { res.json({ success: true, data: await eventCatService.list() }) }
  catch (err) { handleErr(res, err) }
}

export async function createCategory(req, res) {
  try { res.status(201).json({ success: true, data: await eventCatService.create(req.body.name) }) }
  catch (err) { handleErr(res, err) }
}

export async function updateCategory(req, res) {
  try { res.json({ success: true, data: await eventCatService.update(req.params.id, req.body.name) }) }
  catch (err) { handleErr(res, err) }
}

export async function deleteCategory(req, res) {
  try { await eventCatService.remove(req.params.id); res.json({ success: true, message: 'Deleted' }) }
  catch (err) { handleErr(res, err) }
}
