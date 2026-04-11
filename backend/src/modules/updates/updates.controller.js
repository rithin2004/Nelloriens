import { updatesService, updateCatService } from './updates.service.js'
import { log } from '../../utils/auditLog.js'

export async function list(req, res) {
  res.json({ success: true, ...(await updatesService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await updatesService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await updatesService.create(req.body)
  await log(req, 'create', 'updates', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await updatesService.update(req.params.id, req.body)
  await log(req, 'update', 'updates', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await updatesService.remove(req.params.id)
  await log(req, 'delete', 'updates', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

export async function listCategories(req, res) {
  res.json(await updateCatService.list())
}

export async function createCategory(req, res) {
  const data = await updateCatService.create(req.body.name)
  res.status(201).json({ success: true, data })
}

export async function updateCategory(req, res) {
  const data = await updateCatService.update(req.params.id, req.body.name)
  res.json({ success: true, data })
}

export async function deleteCategory(req, res) {
  await updateCatService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}
