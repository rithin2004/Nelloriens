import { resultsService, resultCatService } from './results.service.js'
import { log } from '../../utils/auditLog.js'

export async function list(req, res) {
  res.json({ success: true, ...(await resultsService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await resultsService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await resultsService.create(req.body)
  await log(req, 'create', 'results', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await resultsService.update(req.params.id, req.body)
  await log(req, 'update', 'results', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await resultsService.remove(req.params.id)
  await log(req, 'delete', 'results', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

export async function listCategories(req, res) {
  res.json(await resultCatService.list())
}

export async function createCategory(req, res) {
  const data = await resultCatService.create(req.body.name)
  res.status(201).json({ success: true, data })
}

export async function updateCategory(req, res) {
  const data = await resultCatService.update(req.params.id, req.body.name)
  res.json({ success: true, data })
}

export async function deleteCategory(req, res) {
  await resultCatService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted' })
}
