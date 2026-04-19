import { eventsService, eventCatService, influencerEventsService } from './events.service.js'
import { log } from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

export async function list(req, res) {
  const { items, total, page, totalPages } = await eventsService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function getById(req, res) {
  const data = await eventsService.getById(req.params.id)
  res.json({ success: true, message: 'OK', data })
}

export async function create(req, res) {
  const data = await eventsService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'events', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await eventsService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'events', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await eventsService.remove(req.params.id)
  await log(req, 'delete', 'events', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

export async function listCategories(req, res) {
  const data = await eventCatService.list()
  res.json({ success: true, message: 'OK', data })
}

export async function createCategory(req, res) {
  const data = await eventCatService.create(req.body.name)
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateCategory(req, res) {
  const data = await eventCatService.update(req.params.id, req.body.name)
  res.json({ success: true, message: 'Updated', data })
}

export async function deleteCategory(req, res) {
  await eventCatService.remove(req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await eventsService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementCardViews(req, res) {
  await eventsService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}

// ── Influencer Events (RULE 27 — separate section, no categories, max 5) ──
export async function listInfluencerEvents(req, res) {
  const { items, total, page, totalPages } = await influencerEventsService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}
export async function getInfluencerEventById(req, res) {
  const data = await influencerEventsService.getById(req.params.id)
  res.json({ success: true, message: 'OK', data })
}
export async function createInfluencerEvent(req, res) {
  const data = await influencerEventsService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'influencer_events', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}
export async function updateInfluencerEvent(req, res) {
  const data = await influencerEventsService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'influencer_events', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}
export async function removeInfluencerEvent(req, res) {
  await influencerEventsService.remove(req.params.id)
  await log(req, 'delete', 'influencer_events', req.params.id)
  res.json({ success: true, message: 'Moved to Recycle Bin', data: null })
}
export async function incrementInfluencerPageViews(req, res) {
  await influencerEventsService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementInfluencerCardViews(req, res) {
  await influencerEventsService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
