import { eventsService, eventCatService } from './events.service.js'
import { log } from '../../utils/auditLog.js'

export async function list(req, res) {
  res.json({ success: true, ...(await eventsService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await eventsService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await eventsService.create(req.body)
  await log(req, 'create', 'events', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await eventsService.update(req.params.id, req.body)
  await log(req, 'update', 'events', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await eventsService.remove(req.params.id)
  await log(req, 'delete', 'events', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

export async function listCategories(req, res) {
  res.json(await eventCatService.list())
}

export async function createCategory(req, res) {
  const data = await eventCatService.create(req.body.name)
  res.status(201).json({ success: true, data })
}

export async function updateCategory(req, res) {
  const data = await eventCatService.update(req.params.id, req.body.name)
  res.json({ success: true, data })
}

export async function deleteCategory(req, res) {
  await eventCatService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}
