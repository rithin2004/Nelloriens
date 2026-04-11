import { staysService } from './stays.service.js'
import { log }          from '../../utils/auditLog.js'

export async function list(req, res) {
  res.json({ success: true, ...(await staysService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await staysService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await staysService.create(req.body)
  await log(req, 'create', 'stays', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await staysService.update(req.params.id, req.body)
  await log(req, 'update', 'stays', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await staysService.remove(req.params.id)
  await log(req, 'delete', 'stays', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}
