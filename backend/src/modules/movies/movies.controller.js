import { moviesService, theatresService, trailersService } from './movies.service.js'
import { log } from '../../utils/auditLog.js'
import { createTracking, updateTracking } from '../../utils/userTracking.js'

// ── Movies ─────────────────────────────────────────────────────────────────

export async function list(req, res) {
  res.json({ success: true, ...(await moviesService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await moviesService.getById(req.params.id))
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
  res.json({ success: true, message: 'Deleted' })
}

// ── Theatres ───────────────────────────────────────────────────────────────

export async function listTheatres(req, res) {
  res.json(await theatresService.list({}))
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
  res.json({ success: true, message: 'Deleted' })
}

// ── Trailers (RULE 35 — separate section) ─────────────────────────────────

export async function listTrailers(req, res) {
  res.json({ success: true, ...(await trailersService.list(req.query)) })
}

export async function getTrailerById(req, res) {
  res.json(await trailersService.getById(req.params.id))
}

export async function createTrailer(req, res) {
  const data = await trailersService.create({ ...req.body, ...createTracking(req.user) })
  await log(req, 'create', 'movies', data._id, { movieName: data.movieName, type: 'trailer' })
  res.status(201).json({ success: true, message: 'Trailer created', data })
}

export async function updateTrailer(req, res) {
  const data = await trailersService.update(req.params.id, { ...req.body, ...updateTracking(req.user) })
  await log(req, 'update', 'movies', req.params.id, { type: 'trailer' })
  res.json({ success: true, message: 'Trailer updated', data })
}

export async function removeTrailer(req, res) {
  await trailersService.remove(req.params.id)
  await log(req, 'delete', 'movies', req.params.id, { type: 'trailer' })
  res.json({ success: true, message: 'Trailer deleted' })
}

// ── View increments (RULE 11 — public, no auth) ────────────────────────────
export async function incrementPageViews(req, res) {
  await moviesService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true })
}
export async function incrementCardViews(req, res) {
  await moviesService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true })
}
export async function incrementTrailerPageViews(req, res) {
  await trailersService.incrementViews(req.params.id, 'pageViews')
  res.json({ success: true })
}
export async function incrementTrailerCardViews(req, res) {
  await trailersService.incrementViews(req.params.id, 'cardViews')
  res.json({ success: true })
}
