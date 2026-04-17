import { dashboardService } from './dashboard.service.js'

export const dashboardCtrl = {
  async getStats(req, res) {
    res.json(await dashboardService.getStats())
  },
  async getActivity(req, res) {
    res.json({ success: true, ...(await dashboardService.getActivity(req.query)) })
  },
  async getRecentLeads(req, res) {
    res.json(await dashboardService.getRecentLeads())
  },
  async getRecentUpdates(req, res) {
    res.json(await dashboardService.getRecentUpdates())
  },
  async getFeatured(req, res) {
    res.json(await dashboardService.getFeatured())
  },
}
