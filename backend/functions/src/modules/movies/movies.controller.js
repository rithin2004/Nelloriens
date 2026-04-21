import { moviesService, theatresService } from './movies.service.js'
import { log } from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

// ── Movies ─────────────────────────────────────────────────────────────────

export async function list(req, res) {
  const { items, total, page, totalPages } = await moviesService.list(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function getById(req, res) {
  const data = await moviesService.getById(req.params.id)
  res.json({ success: true, message: 'OK', data })
}

export async function create(req, res) {
  const data = await moviesService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'movies', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await moviesService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'movies', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await moviesService.remove(req.params.id)
  await log(req, 'delete', 'movies', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── Theatres ───────────────────────────────────────────────────────────────

export async function listTheatres(req, res) {
  const { items, total, page, totalPages } = await theatresService.list({})
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function createTheatre(req, res) {
  const data = await theatresService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'theatres', data._id, { name: data.name })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateTheatre(req, res) {
  const data = await theatresService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'theatres', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function removeTheatre(req, res) {
  await theatresService.remove(req.params.id)
  await log(req, 'delete', 'theatres', req.params.id)
  res.json({ success: true, message: 'Deleted', data: null })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await moviesService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true, message: 'OK' })
}
export async function incrementCardViews(req, res) {
  await moviesService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true, message: 'OK' })
}
