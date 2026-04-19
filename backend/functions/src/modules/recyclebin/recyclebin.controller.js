import * as svc from './recyclebin.service.js'
import { log }  from '../../utils/auditLog.js'

export async function list(req, res) {
  const { items, total, page, totalPages } = await svc.listBin(req.query)
  res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
}

export async function stats(req, res) {
  const data = await svc.binStats()
  res.json({ success: true, message: 'OK', data })
}

export async function restore(req, res) {
  // RULE 9: module no longer needed in URL — originalCollection is stored in the recyclebin doc
  const { id } = req.params
  const item   = await svc.restoreItem(id)
  await log(req, 'restore', item.module || 'recyclebin', id, { title: item.title })
  res.json({ success: true, message: 'Item restored successfully', data: item })
}

export async function purge(req, res) {
  const { id } = req.params
  const item   = await svc.purgeItem(id)
  await log(req, 'purge', item.module || 'recyclebin', id, { title: item.title })
  res.json({ success: true, message: 'Item permanently deleted', data: null })
}

export async function purgeAll(req, res) {
  const { module } = req.query
  const count      = await svc.purgeAll(module)
  await log(req, 'purge_all', module || 'recyclebin', null, { count })
  res.json({ success: true, message: `${count} item(s) permanently deleted`, data: null })
}
