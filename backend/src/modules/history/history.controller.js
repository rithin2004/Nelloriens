import { historyService, reorderHistory } from './history.service.js'
import { log } from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

export async function list(req, res) {
  res.json({ success: true, ...(await historyService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await historyService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await historyService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'history', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await historyService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'history', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await historyService.remove(req.params.id)
  await log(req, 'delete', 'history', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

export async function reorder(req, res) {
  await reorderHistory(req.body.ids)
  res.json({ success: true, message: 'Reordered' })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await historyService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true })
}
export async function incrementCardViews(req, res) {
  await historyService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true })
}
