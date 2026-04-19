import { sponsorshipsService } from './sponsorships.service.js'
import { log }                 from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

export async function list(req, res) {
  const { items, total, page, totalPages } = await sponsorshipsService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function getById(req, res) {
  const data = await sponsorshipsService.getById(req.params.id)
  res.json({ success: true, message: 'OK', data })
}

export async function create(req, res) {
  const data = await sponsorshipsService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'sponsorships', data._id, { title: data.title || data.name })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await sponsorshipsService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'sponsorships', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await sponsorshipsService.remove(req.params.id)
  await log(req, 'delete', 'sponsorships', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Count increments (RULE 11 — public, no auth) ──────────────────────────
export async function incrementPageViews(req, res) {
  await sponsorshipsService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementCardViews(req, res) {
  await sponsorshipsService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementImpressions(req, res) {
  await sponsorshipsService.incrementViews(req.params.id, 'impressions')
  res.json({ success: true, message: 'OK' })
}
export async function incrementClicks(req, res) {
  await sponsorshipsService.incrementViews(req.params.id, 'clicks')
  res.json({ success: true, message: 'OK' })
}
