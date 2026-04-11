import { transportService, transportCategoriesService } from './transport.service.js'
import { log } from '../../utils/auditLog.js'

export async function list(req, res) {
  res.json({ success: true, ...(await transportService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await transportService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await transportService.create(req.body)
  await log(req, 'create', 'transport', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await transportService.update(req.params.id, req.body)
  await log(req, 'update', 'transport', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await transportService.remove(req.params.id)
  await log(req, 'delete', 'transport', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

export async function listCategories(req, res) {
  res.json(await transportCategoriesService.list())
}

export async function createCategory(req, res) {
  const data = await transportCategoriesService.create(req.body.name)
  res.status(201).json({ success: true, data })
}

export async function updateCategory(req, res) {
  const data = await transportCategoriesService.update(req.params.id, req.body.name)
  res.json({ success: true, data })
}

export async function deleteCategory(req, res) {
  await transportCategoriesService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}
