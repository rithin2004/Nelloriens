import { adsService, adsenseService } from './ads.service.js'
import { log }                        from '../../utils/auditLog.js'

// ── Manual Ads ─────────────────────────────────────────────────────────────
export async function list(req, res) {
  res.json({ success: true, ...(await adsService.list(req.query)) })
}

export async function getById(req, res) {
  res.json(await adsService.getById(req.params.id))
}

export async function create(req, res) {
  const data = await adsService.create(req.body)
  await log(req, 'create', 'ads', data._id, { title: data.title })
  res.status(201).json({ success: true, message: 'Created', data })
}

export async function update(req, res) {
  const data = await adsService.update(req.params.id, req.body)
  await log(req, 'update', 'ads', req.params.id)
  res.json({ success: true, message: 'Updated', data })
}

export async function remove(req, res) {
  await adsService.remove(req.params.id)
  await log(req, 'delete', 'ads', req.params.id)
  res.json({ success: true, message: 'Deleted' })
}

// ── AdSense Settings ───────────────────────────────────────────────────────
export async function getAdsenseSettings(req, res) {
  res.json(await adsenseService.getSettings())
}

export async function connectAdsense(req, res) {
  const data = await adsenseService.connect(req.body)
  res.json({ success: true, data })
}

export async function updateAdsense(req, res) {
  const data = await adsenseService.update(req.body)
  res.json({ success: true, data })
}

export async function disconnectAdsense(req, res) {
  const data = await adsenseService.disconnect()
  res.json({ success: true, data })
}
