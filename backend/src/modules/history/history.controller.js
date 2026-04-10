import { historyService, reorderHistory } from './history.service.js'
import { handleErr } from '../../utils/serviceBase.js'
import { log }       from '../../utils/auditLog.js'

export async function list(req, res) {
  try { res.json({ success: true, ...(await historyService.list(req.query)) }) }
  catch (err) { handleErr(res, err) }
}

export async function getById(req, res) {
  try { res.json({ success: true, data: await historyService.getById(req.params.id) }) }
  catch (err) { handleErr(res, err) }
}

export async function create(req, res) {
  try {
    const data = await historyService.create(req.body)
    await log(req, 'create', 'history', data._id, { title: data.title })
    res.status(201).json({ success: true, message: 'Created', data })
  } catch (err) { handleErr(res, err) }
}

export async function update(req, res) {
  try {
    const data = await historyService.update(req.params.id, req.body)
    await log(req, 'update', 'history', req.params.id)
    res.json({ success: true, message: 'Updated', data })
  } catch (err) { handleErr(res, err) }
}

export async function remove(req, res) {
  try {
    await historyService.remove(req.params.id)
    await log(req, 'delete', 'history', req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) { handleErr(res, err) }
}

export async function reorder(req, res) {
  try {
    await reorderHistory(req.body.items)
    res.json({ success: true, message: 'Reordered' })
  } catch (err) { handleErr(res, err) }
}
