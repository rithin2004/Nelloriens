import { moviesService, theatresService } from './movies.service.js'
import { handleErr } from '../../utils/serviceBase.js'
import { log }       from '../../utils/auditLog.js'

// ── Movies ─────────────────────────────────────────────────────────────────

export async function list(req, res) {
  try { res.json({ success: true, ...(await moviesService.list(req.query)) }) }
  catch (err) { handleErr(res, err) }
}

export async function getById(req, res) {
  try { res.json({ success: true, data: await moviesService.getById(req.params.id) }) }
  catch (err) { handleErr(res, err) }
}

export async function create(req, res) {
  try {
    const data = await moviesService.create(req.body)
    await log(req, 'create', 'movies', data._id, { title: data.title })
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function update(req, res) {
  try {
    const data = await moviesService.update(req.params.id, req.body)
    await log(req, 'update', 'movies', req.params.id)
    res.json({ success: true, message: 'Updated', data })
  } catch (err) { handleErr(res, err) }
}

export async function remove(req, res) {
  try {
    await moviesService.remove(req.params.id)
    await log(req, 'delete', 'movies', req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}

// ── Theatres ───────────────────────────────────────────────────────────────

export async function listTheatres(req, res) {
  try { res.json({ success: true, data: await theatresService.list({}) }) }
  catch (err) { handleErr(res, err) }
}

export async function createTheatre(req, res) {
  try {
    const data = await theatresService.create(req.body)
    await log(req, 'create', 'theatres', data._id, { name: data.name })
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function updateTheatre(req, res) {
  try {
    const data = await theatresService.update(req.params.id, req.body)
    await log(req, 'update', 'theatres', req.params.id)
    res.json({ success: true, message: 'Updated', data })
  } catch (err) { handleErr(res, err) }
}

export async function removeTheatre(req, res) {
  try {
    await theatresService.remove(req.params.id)
    await log(req, 'delete', 'theatres', req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}
