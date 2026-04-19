import { adsService, adsenseService } from './ads.service.js'
import { log }                        from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

// ── Manual Ads ─────────────────────────────────────────────────────────────
export async function list(req, res) {
  const { items, total, page, totalPages } = await adsService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function getById(req, res) {
  const data = await adsService.getById(req.params.id)
  res.json({ success: true, message: 'OK', data })
}

export async function create(req, res) {
  const data = await adsService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'ads', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await adsService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'ads', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await adsService.remove(req.params.id)
  await log(req, 'delete', 'ads', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── AdSense Settings ───────────────────────────────────────────────────────
export async function getAdsenseSettings(req, res) {
  const data = await adsenseService.getSettings()
  res.json({ success: true, message: 'OK', data })
}

export async function connectAdsense(req, res) {
  const data = await adsenseService.connect(req.body)
  res.json({ success: true, message: 'Connected', data })
}

export async function updateAdsense(req, res) {
  const data = await adsenseService.update(req.body)
  res.json({ success: true, message: 'Updated', data })
}

export async function disconnectAdsense(req, res) {
  const data = await adsenseService.disconnect()
  res.json({ success: true, message: 'Disconnected', data })
}

// ── Count increments (RULE 11 — public, no auth) ──────────────────────────
export async function incrementPageViews(req, res) {
  await adsService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementCardViews(req, res) {
  await adsService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementImpressions(req, res) {
  await adsService.incrementViews(req.params.id, 'impressions')
  res.json({ success: true, message: 'OK' })
}
export async function incrementClicks(req, res) {
  await adsService.incrementViews(req.params.id, 'clicks')
  res.json({ success: true, message: 'OK' })
}
