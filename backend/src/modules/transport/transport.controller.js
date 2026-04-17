import { transportService, TRANSPORT_TYPES } from './transport.service.js'
import { log } from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

export async function list(req, res) {
  res.json({ success: true, ...(await transportService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await transportService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await transportService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'transport', data._id, { name: data.name, type: data.type })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await transportService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'transport', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await transportService.remove(req.params.id)
  await log(req, 'delete', 'transport', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

// Returns the fixed transport types list (no management — RULE 31)
export async function getTypes(req, res) {
  res.json({ success: true, data: TRANSPORT_TYPES })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await transportService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true })
}
export async function incrementCardViews(req, res) {
  await transportService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true })
}
