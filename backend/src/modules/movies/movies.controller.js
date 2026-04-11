import { moviesService, theatresService } from './movies.service.js'
import { log } from '../../utils/auditLog.js'

// ── Movies ─────────────────────────────────────────────────────────────────

export async function list(req, res) {
  res.json({ success: true, ...(await moviesService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await moviesService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await moviesService.create(req.body)
  await log(req, 'create', 'movies', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await moviesService.update(req.params.id, req.body)
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
  const data = await theatresService.create(req.body)
  await log(req, 'create', 'theatres', data._id, { name: data.name })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function updateTheatre(req, res) {
  const data = await theatresService.update(req.params.id, req.body)
  await log(req, 'update', 'theatres', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function removeTheatre(req, res) {
  await theatresService.remove(req.params.id)
  await log(req, 'delete', 'theatres', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}
