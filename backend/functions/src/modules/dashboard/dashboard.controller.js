import { dashboardService } from './dashboard.service.js'

export const dashboardCtrl = {
  async getStats(req, res) {
    const data = await dashboardService.getStats()
    res.json({ success: true, message: 'OK', data })
  },
  async getActivity(req, res) {
    const { items, total, page, totalPages } = await dashboardService.getActivity(req.query)
    res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
  },
  async getRecentLeads(req, res) {
    const data = await dashboardService.getRecentLeads()
    res.json({ success: true, message: 'OK', data })
  },
  async getRecentUpdates(req, res) {
    const data = await dashboardService.getRecentUpdates()
    res.json({ success: true, message: 'OK', data })
  },
  async getFeatured(req, res) {
    const data = await dashboardService.getFeatured()
    res.json({ success: true, message: 'OK', data })
  },
}
