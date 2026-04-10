import { dashboardService } from './dashboard.service.js'
import { handleErr }        from '../../utils/serviceBase.js'

export const dashboardCtrl = {
  async getStats(req, res) {
    try { res.json({ success: true, data: await dashboardService.getStats() }) }
    catch (err) { handleErr(res, err) }
  },
  async getActivity(req, res) {
    try { res.json({ success: true, ...(await dashboardService.getActivity(req.query)) }) }
    catch (err) { handleErr(res, err) }
  },
  async getRecentLeads(req, res) {
    try { res.json({ success: true, data: await dashboardService.getRecentLeads() }) }
    catch (err) { handleErr(res, err) }
  },
  async getRecentUpdates(req, res) {
    try { res.json({ success: true, data: await dashboardService.getRecentUpdates() }) }
    catch (err) { handleErr(res, err) }
  },
  async getFeatured(req, res) {
    try { res.json({ success: true, data: await dashboardService.getFeatured() }) }
    catch (err) { handleErr(res, err) }
  },
}
