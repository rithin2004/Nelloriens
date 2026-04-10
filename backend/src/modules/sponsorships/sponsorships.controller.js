import { sponsorshipsService } from './sponsorships.service.js'
import { handleErr }           from '../../utils/serviceBase.js'
import { log }                 from '../../utils/auditLog.js'

export async function list(req, res) {
  try { res.json({ success: true, ...(await sponsorshipsService.list(req.query)) }) }
  catch (err) { handleErr(res, err) }
}

export async function getById(req, res) {
  try { res.json({ success: true, data: await sponsorshipsService.getById(req.params.id) }) }
  catch (err) { handleErr(res, err) }
}

export async function create(req, res) {
  try {
    const data = await sponsorshipsService.create(req.body)
    await log(req, 'create', 'sponsorships', data._id, { title: data.title || data.name })
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function update(req, res) {
  try {
    const data = await sponsorshipsService.update(req.params.id, req.body)
    await log(req, 'update', 'sponsorships', req.params.id)
    res.json({ success: true, message: 'Updated', data })
  } catch (err) { handleErr(res, err) }
}

export async function remove(req, res) {
  try {
    await sponsorshipsService.remove(req.params.id)
    await log(req, 'delete', 'sponsorships', req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}
