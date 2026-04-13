import * as svc from './recyclebin.service.js'
import { log }  from '../../utils/auditLog.js'

export async function list(req, res) {
  const result = await svc.listBin(req.query)
  res.json({ success: true, ...result })
}

export async function stats(req, res) {
  const data = await svc.binStats()
  res.json({ success: true, data })
}

export async function restore(req, res) {
  const { id, module } = req.params
  const item = await svc.restoreItem(id, module)
  await log(req, 'restore', module, id, { title: item.title })
  res.json({ success: true, message: 'Item restored successfully', data: item })
}

export async function purge(req, res) {
  const { id, module } = req.params
  await svc.purgeItem(id, module)
  await log(req, 'purge', module, id)
  res.json({ success: true, message: 'Item permanently deleted' })
}

export async function purgeAll(req, res) {
  const { module } = req.query
  const count = await svc.purgeAll(module)
  await log(req, 'purge_all', module || 'recyclebin', null, { count })
  res.json({ success: true, message: `${count} item(s) permanently deleted` })
}
