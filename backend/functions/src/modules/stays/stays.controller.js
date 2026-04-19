import { staysService } from './stays.service.js'
import { log }          from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

export async function list(req, res) {
  const { items, total, page, totalPages } = await staysService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function getById(req, res) {
  const data = await staysService.getById(req.params.id)
  res.json({ success: true, message: 'OK', data })
}

export async function create(req, res) {
  const data = await staysService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'stays', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await staysService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'stays', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await staysService.remove(req.params.id)
  await log(req, 'delete', 'stays', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await staysService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementCardViews(req, res) {
  await staysService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
