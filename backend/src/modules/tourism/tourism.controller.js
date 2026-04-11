import { tourismService, tourismCatService } from './tourism.service.js'
import { log } from '../../utils/auditLog.js'

export async function list(req, res) {
  res.json({ success: true, ...(await tourismService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await tourismService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await tourismService.create(req.body)
  await log(req, 'create', 'tourism', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await tourismService.update(req.params.id, req.body)
  await log(req, 'update', 'tourism', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await tourismService.remove(req.params.id)
  await log(req, 'delete', 'tourism', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

export async function listCategories(req, res) {
  res.json(await tourismCatService.list())
}

export async function createCategory(req, res) {
  const data = await tourismCatService.create(req.body.name)
  res.status(201).json({ success: true, data })
}

export async function updateCategory(req, res) {
  const data = await tourismCatService.update(req.params.id, req.body.name)
  res.json({ success: true, data })
}

export async function deleteCategory(req, res) {
  await tourismCatService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}
